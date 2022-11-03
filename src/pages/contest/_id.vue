<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';

import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';
import MdEditor from '@/components/MdEditor.vue';
import ProblemTable from '@/components/ProblemTable.vue';

const route = useRoute(),
  message = useMessage();
const id = route.params.id,
  contestData = ref({}),
  mode = ref('比赛');

const loadData = () => {
  Axios.get(`/contest/${id}/`).then(res => {
    res.start_time = (res.start_time && Number(new Date(res.start_time))) || 0;
    res.end_time = (res.end_time && Number(new Date(res.end_time))) || 0;
    contestData.value = res;
    mode.value = res.problem_list_mode ? '题单' : '比赛';
  });
};

loadData();

const beforeLeave = tabName => {
  if (tabName === 'edit') {
    router.push({
      name: 'contest_edit',
      params: { id },
    });
    return false;
  }
  return true;
};

const submitData = ref({ source: '', language: 'cpp' }),
  submiting = ref(false);

const submit = () => {
  if (!submitData.value.source) {
    message.warning('代码不能为空');
    return;
  }
  submiting.value = true;
  Axios.post('/submission/', { problem_id: id, ...submitData.value })
    .then(res => {
      router.push({ name: 'submission_detail', params: { id: res.id } });
    })
    .finally(() => {
      submiting.value = false;
    });
};
</script>

<template>
  <div>
    <h1>#{{ contestData.id }}&ensp;{{ contestData.title }}</h1>
  </div>
  <n-layout has-sider>
    <n-layout-content>
      <n-tabs
        type="line"
        size="large"
        :tabs-padding="20"
        @before-leave="beforeLeave"
      >
        <template #suffix>
          <div style="font-size: medium" v-if="!contestData.problem_list_mode">
            <span
              v-if="
                contestData.start_time && contestData.start_time > Date.now()
              "
            >
              距离比赛开始还有：
              <n-countdown :duration="contestData.start_time - Date.now()" />
            </span>
            <span
              v-else-if="
                contestData.end_time && contestData.end_time > Date.now()
              "
            >
              距离比赛结束还有：
              <n-countdown :duration="contestData.end_time - Date.now()" />
            </span>
            <span v-else>比赛已结束</span>
          </div>
        </template>
        <n-tab-pane name="description" :tab="mode + '信息'">
          <n-space vertical size="large">
            <div></div>

            <div>
              <h2>类型</h2>
              <span style="font-size: medium">{{ mode }}</span>
            </div>

            <div v-if="!contestData.problem_list_mode">
              <h2>比赛时间</h2>
              <span
                style="font-size: medium"
                v-if="contestData.start_time || contestData.end_time"
              >
                <n-time
                  :time="contestData.start_time"
                  format="yyyy-MM-dd HH:mm:ss"
                  style="margin-right: 10px"
                />
                ~
                <n-time
                  :time="contestData.end_time"
                  format="yyyy-MM-dd HH:mm:ss"
                  style="margin-left: 10px"
                />
              </span>
            </div>

            <div v-if="contestData.description">
              <h2>{{ mode }}描述</h2>
              <n-card class="description">
                <MdEditor
                  :content="contestData.description"
                  :previewOnly="true"
                />
              </n-card>
            </div>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="problem" tab="题目列表">
          <ProblemTable :data="contestData.problems" />
        </n-tab-pane>
        <n-tab-pane
          name="ranking"
          tab="排行榜"
          v-if="!contestData.problem_list_mode"
        />
        <n-tab-pane
          name="edit"
          :tab="'修改' + mode"
          v-if="store.state.user.is_staff"
        />
      </n-tabs>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
.n-layout-content,
.n-layout-sider {
  margin: 20px !important;
}

.description :deep(.n-card__content) {
  padding: 0 20px !important;
  margin: 0 10px !important;
}
</style>
