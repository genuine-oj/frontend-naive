<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Axios from '@/plugins/axios';
import router from '@/router';
import MdEditor from '@/components/MdEditor.vue';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const contest = ref({
    problem_list_mode: false,
    problems: [],
    users: [],
    title: '',
    description: '',
    is_hidden: false,
    allow_sign_up: true,
  }),
  contest_time_range = ref([
    Math.floor(Date.now() / 3600000) * 3600000,
    Math.floor(Date.now() / 3600000) * 3600000 + 86400000,
  ]);

const problemOptions = ref([]),
  loadingProblem = ref(false);
const searchProblem = search => {
  if (!search) {
    problemOptions.value = [];
    return;
  }
  loadingProblem.value = true;
  Axios.get(`/problem/`, {
    params: {
      search,
    },
  })
    .then(res => {
      res = res.results;
      problemOptions.value = res.map(item => ({
        label: `#${item.id} | ${item.title}`,
        value: item.id,
      }));
    })
    .finally(() => {
      loadingProblem.value = false;
    });
};

const userOptions = ref([]),
  loadingUser = ref(false);
const searchUser = search => {
  if (!search) {
    userOptions.value = [];
    return;
  }
  loadingUser.value = true;
  Axios.get(`/user/`, {
    params: {
      search,
    },
  })
    .then(res => {
      res = res.results;
      userOptions.value = res.map(item => ({
        label: item.username,
        value: item.id,
      }));
    })
    .finally(() => {
      loadingUser.value = false;
    });
};

if (id) {
  Axios.get(`/contest/${id}/`).then(res => {
    problemOptions.value = res.problems.map(item => ({
      label: `#${item.id} | ${item.title}`,
      value: item.id,
    }));
    res.problems = res.problems.map(item => item.id);
    userOptions.value = res.users.map(item => ({
      label: item.username,
      value: item.id,
    }));
    res.start_time = (res.start_time && Number(new Date(res.start_time))) || 0;
    res.end_time = (res.end_time && Number(new Date(res.end_time))) || 0;
    contest_time_range.value = [res.start_time, res.end_time];
    res.users = res.users.map(item => item.id);
    contest.value = res;
  });
}

const submiting = ref(false);
const submit = () => {
  const data = contest.value;
  data.start_time = contest_time_range.value[0];
  data.end_time = contest_time_range.value[1];
  if (!data.title) {
    message.warning('比赛标题不能为空');
    return;
  } else if (!data.problem_list_mode && !(data.start_time && data.end_time)) {
    message.warning('比赛开始时间和结束时间不能为空');
    return;
  } else if (
    data.start_time &&
    data.end_time &&
    data.end_time - data.start_time < 60000
  ) {
    message.warning('比赛持续时间不能小于60秒');
    return;
  }
  data.start_time =
    (data.start_time && new Date(data.start_time).toISOString()) || null;
  data.end_time =
    (data.end_time && new Date(data.end_time).toISOString()) || null;
  if (data.problem_list_mode) {
    data.is_hidden = false;
  }
  submiting.value = true;
  let req;
  if (id) req = Axios.put(`/contest/${id}/`, data);
  else req = Axios.post('/contest/', data);
  req
    .then(res => {
      if (!id) router.push({ name: 'contest_detail', params: { id: res.id } });
      else message.success('修改成功');
    })
    .finally(() => {
      submiting.value = false;
    });
};

const deleteContest = () => {
  Axios.delete(`/contest/${id}/`).then(() => {
    message.success('删除成功！');
    router.push({ name: 'contest_list' });
  });
};
</script>

<template>
  <h1>
    <n-space style="align-items: center" size="large">
      {{ id ? '编辑' : '创建' }}比赛 {{ id ? ` #${id}` : '' }}
      <n-button
        v-if="id"
        @click="router.push({ name: 'contest_detail', params: { id } })"
        style="display: flex; align-items: center"
      >
        返回
      </n-button>
    </n-space>
  </h1>

  <n-divider />

  <n-space vertical size="large">
    <div>
      <h2>模式</h2>
      <n-radio-group
        v-model:value="contest.problem_list_mode"
        name="radiogroup"
      >
        <n-space>
          <n-radio :value="false">比赛模式</n-radio>
          <n-radio :value="true">题单模式</n-radio>
        </n-space>
      </n-radio-group>
    </div>
    <div>
      <h2>比赛名称</h2>
      <n-input
        v-model:value="contest.title"
        placeholder="请输入名称"
        size="large"
      />
    </div>
    <div>
      <h2>比赛描述</h2>
      <MdEditor v-model:content="contest.description" />
    </div>
    <div>
      <h2>题目列表</h2>
      <n-select
        v-model:value="contest.problems"
        multiple
        filterable
        placeholder="搜索题目"
        :options="problemOptions"
        :loading="loadingProblem"
        clearable
        remote
        :clear-filter-after-select="true"
        @search="searchProblem"
      />
    </div>
    <div v-show="!contest.problem_list_mode">
      <h2>人员设置</h2>
      <h3>是否允许报名</h3>
      <n-switch v-model:value="contest.allow_sign_up" />
      <h3>参赛人员</h3>
      <n-select
        v-model:value="contest.users"
        multiple
        filterable
        placeholder="搜索用户"
        :options="userOptions"
        :loading="loadingUser"
        clearable
        remote
        :clear-filter-after-select="true"
        @search="searchUser"
      />
    </div>
    <div v-show="!contest.problem_list_mode">
      <h2>时间设置</h2>
      <n-space>
        <n-date-picker
          type="datetimerange"
          v-model:value="contest_time_range"
          format="yyyy-MM-dd HH:mm"
        />
      </n-space>
    </div>
    <div v-show="!contest.problem_list_mode">
      <h2>其它设置</h2>
      <n-row style="padding: 0 1px">
        <n-col :span="4">
          <h3>是否隐藏</h3>
          <n-switch v-model:value="contest.is_hidden" />
        </n-col>
      </n-row>
    </div>
  </n-space>

  <n-divider />

  <n-space>
    <n-button
      type="primary"
      size="large"
      @click="submit"
      :loading="submiting"
      :disabled="submiting"
    >
      保存
    </n-button>
    <n-popconfirm @positive-click="deleteContest" v-if="id">
      <template #trigger>
        <n-button type="error" size="large"> 删除 </n-button>
      </template>
      您确认要删除{{ contest.problem_list_mode ? '题单' : '比赛' }}
      {{ contest.title }} 吗？该操作不可撤销。
    </n-popconfirm>
  </n-space>
</template>
