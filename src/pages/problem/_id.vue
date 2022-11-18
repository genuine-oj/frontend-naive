<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';

import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';
import MdEditor from '@/components/MdEditor.vue';
import { languageOptions } from '@/plugins/consts';
import CodeMirror from '@/components/CodeMirror.vue';
import CodeWithCard from '@/components/CodeWithCard.vue';
import { MemoryOutlined, AccessTimeOutlined } from '@vicons/material';

const route = useRoute(),
  message = useMessage();
const id = route.params.id,
  problemData = ref({});

const loadData = () => {
  Axios.get(`/problem/${id}/`).then(res => {
    problemData.value = res;
  });
};

loadData();

const beforeLeave = tabName => {
  if (tabName === 'submission') {
    router.push({
      name: 'submission_list',
      query: { problem__id: id },
    });
    return false;
  } else if (tabName === 'edit') {
    router.push({
      name: 'problem_edit',
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
  <h1>#{{ problemData.id }}&ensp;{{ problemData.title }}</h1>
  <n-layout has-sider>
    <n-layout-content>
      <n-tabs
        type="line"
        size="large"
        :tabs-padding="20"
        @before-leave="beforeLeave"
      >
        <n-tab-pane name="description" tab="题目描述">
          <n-space vertical size="large">
            <div />

            <div>
              <n-space size="small">
                <n-tag :bordered="false">
                  {{ problemData.time_limit }} ms
                  <template #icon>
                    <n-icon :component="AccessTimeOutlined" />
                  </template>
                </n-tag>
                <n-tag :bordered="false">
                  {{ problemData.memory_limit }} MB
                  <template #icon>
                    <n-icon :component="MemoryOutlined" />
                  </template>
                </n-tag>
                <n-tag v-for="item in problemData.tags" :key="item.id">
                  {{ item.name }}
                </n-tag>
              </n-space>
            </div>

            <div v-if="problemData.description">
              <h2>题目描述</h2>
              <n-card class="description">
                <MdEditor :content="problemData.description" previewOnly />
              </n-card>
            </div>

            <div v-if="problemData.input_format">
              <h2>输入格式</h2>
              <n-card class="description">
                <MdEditor :content="problemData.input_format" previewOnly />
              </n-card>
            </div>

            <div v-if="problemData.output_format">
              <h2>输出格式</h2>
              <n-card class="description">
                <MdEditor :content="problemData.output_format" previewOnly />
              </n-card>
            </div>

            <div v-if="problemData.samples">
              <h2>样例</h2>
              <div
                v-for="item in problemData.samples"
                :key="item.index"
                style="width: 100%"
              >
                <n-row v-if="item.input || item.output" :gutter="12">
                  <n-col :span="11">
                    <h3>样例输入 #{{ item.index }}</h3>
                    <CodeWithCard :code="item.input" />
                  </n-col>
                  <n-col :span="2"></n-col>
                  <n-col :span="11">
                    <h3>样例输出 #{{ item.index }}</h3>
                    <CodeWithCard :code="item.output" />
                  </n-col>
                </n-row>
              </div>
            </div>

            <div v-if="problemData.hint">
              <h2>提示</h2>
              <n-card class="description">
                <MdEditor :content="problemData.hint" previewOnly />
              </n-card>
            </div>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="submit" tab="提交">
          <n-row>
            <n-col :span="16" style="padding: 0 25px">
              <CodeMirror
                v-model:code="submitData.source"
                :language="submitData.language"
              />
            </n-col>
            <n-col :span="8" style="padding: 0 25px">
              <n-space vertical :size="30">
                <n-select
                  v-model:value="submitData.language"
                  size="large"
                  :options="languageOptions"
                />
                <n-button
                  type="primary"
                  size="large"
                  style="width: 100%"
                  @click="submit"
                  :loading="submiting"
                  :disabled="submiting"
                >
                  提交
                </n-button>
              </n-space>
            </n-col>
          </n-row>
        </n-tab-pane>
        <n-tab-pane name="submission" tab="提交记录" />
        <n-tab-pane
          name="edit"
          tab="修改题目"
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

.description {
  :deep(.n-card__content) {
    padding: 0 20px !important;
    margin: 0 10px !important;
  }
}
</style>
