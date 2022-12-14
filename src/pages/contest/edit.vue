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
    title: '',
    description: '',
    is_hidden: false,
    allow_sign_up: true,
    allow_submit: true,
  }),
  contest_time_range = ref([Date.now(), Date.now() + 86400000]);

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
    message.warning('????????????????????????');
    return;
  } else if (!data.problem_list_mode && !(data.start_time && data.end_time)) {
    message.warning('?????????????????????????????????????????????');
    return;
  } else if (
    data.start_time &&
    data.end_time &&
    data.end_time - data.start_time < 60000
  ) {
    message.warning('??????????????????????????????60???');
    return;
  }
  data.start_time =
    (data.start_time && new Date(data.start_time).toISOString()) || null;
  data.end_time =
    (data.end_time && new Date(data.end_time).toISOString()) || null;
  if (data.problem_list_mode) {
    data.allow_submit = true;
    data.is_hidden = false;
  }
  submiting.value = true;
  let req;
  if (id) req = Axios.put(`/contest/${id}/`, data);
  else req = Axios.post('/contest/', data);
  req
    .then(res => {
      if (!id) router.push({ name: 'contest_detail', params: { id: res.id } });
      else message.success('????????????');
    })
    .finally(() => {
      submiting.value = false;
    });
};
</script>

<template>
  <h1>
    <n-space style="align-items: center" size="large">
      {{ id ? '??????' : '??????' }}?????? {{ id ? ` #${id}` : '' }}
      <n-button
        v-if="id"
        @click="router.push({ name: 'contest_detail', params: { id } })"
        style="display: flex; align-items: center"
      >
        ??????
      </n-button>
    </n-space>
  </h1>

  <n-divider />

  <n-space vertical size="large">
    <div>
      <h2>??????</h2>
      <n-radio-group
        v-model:value="contest.problem_list_mode"
        name="radiogroup"
      >
        <n-space>
          <n-radio :value="false">????????????</n-radio>
          <n-radio :value="true">????????????</n-radio>
        </n-space>
      </n-radio-group>
    </div>
    <div>
      <h2>????????????</h2>
      <n-input
        v-model:value="contest.title"
        placeholder="???????????????"
        size="large"
      />
    </div>
    <div>
      <h2>????????????</h2>
      <MdEditor v-model:content="contest.description" />
    </div>
    <div>
      <h2>????????????</h2>
      <n-select
        v-model:value="contest.problems"
        multiple
        filterable
        placeholder="????????????"
        :options="problemOptions"
        :loading="loadingProblem"
        clearable
        remote
        :clear-filter-after-select="true"
        @search="searchProblem"
      />
    </div>
    <div v-show="!contest.problem_list_mode">
      <h2>????????????</h2>
      <h3>??????????????????</h3>
      <n-switch v-model:value="contest.allow_sign_up" />
      <h3>????????????</h3>
      <n-select
        v-model:value="contest.users"
        multiple
        filterable
        placeholder="????????????"
        :options="userOptions"
        :loading="loadingUser"
        clearable
        remote
        :clear-filter-after-select="true"
        @search="searchUser"
      />
    </div>
    <div v-show="!contest.problem_list_mode">
      <h2>????????????</h2>
      <n-space>
        <n-date-picker
          type="datetimerange"
          v-model:value="contest_time_range"
        />
      </n-space>
    </div>
    <div v-show="!contest.problem_list_mode">
      <h2>????????????</h2>
      <n-row style="padding: 0 1px">
        <n-col :span="6">
          <h3>???????????????????????????</h3>
          <n-switch v-model:value="contest.allow_submit" />
        </n-col>
        <n-col :span="1"></n-col>
        <n-col :span="6">
          <h3>????????????</h3>
          <n-switch v-model:value="contest.is_hidden" />
        </n-col>
      </n-row>
    </div>
  </n-space>

  <n-divider />

  <n-button
    type="primary"
    size="large"
    @click="submit"
    :loading="submiting"
    :disabled="submiting"
  >
    ??????
  </n-button>
</template>
