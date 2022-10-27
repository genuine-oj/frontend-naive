<script setup>
import { ref } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';
import MdEditor from '@/components/MdEditor.vue';
import { languageOptions } from '@/plugins/consts';

const route = useRoute();
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
      name: 'submission_index',
      query: { problem__id: id },
    });
    return false;
  }
  return true;
};

const submitData = ref({ source: '', language: 'cpp' });

const submit = () => {
  Axios.post('/submission/', { problem_id: id, ...submitData.value }).then(
    res => {
      router.push(`/submission/${res.id}/`);
    }
  );
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
          <h2>题目描述</h2>
          <n-card class="description">
            <MdEditor :content="problemData.description" previewOnly />
          </n-card>

          <h2>输入格式</h2>
          <n-card class="description">
            <MdEditor :content="problemData.input_format" previewOnly />
          </n-card>

          <h2>输出格式</h2>
          <n-card class="description">
            <MdEditor :content="problemData.output_format" previewOnly />
          </n-card>

          <h2>样例</h2>
          <div
            v-for="item in problemData.samples"
            :key="item.index"
            style="width: 100%"
          >
            <n-row v-if="item.input || item.output" :gutter="12">
              <n-col :span="11">
                <h3>样例输入 #{{ item.index }}</h3>
                <n-card class="sample-card">
                  <n-scrollbar x-scrollable>
                    <div class="sample">
                      <n-code :code="item.input" />
                    </div>
                  </n-scrollbar>
                </n-card>
              </n-col>
              <n-col :span="1"></n-col>
              <n-col :span="11">
                <h3>样例输出 #{{ item.index }}</h3>
                <n-card class="sample-card">
                  <n-scrollbar x-scrollable>
                    <div class="sample">
                      <n-code :code="item.output" />
                    </div>
                  </n-scrollbar>
                </n-card>
              </n-col>
            </n-row>
          </div>
        </n-tab-pane>
        <n-tab-pane name="submit" tab="提交">
          <n-row>
            <n-col :span="16" style="padding: 0 25px">
              <n-input
                v-model:value="submitData.source"
                type="textarea"
                placeholder="请输入你的代码"
                :maxlength="200000"
                :rows="20"
                :autosize="{ minRows: 20, maxRows: 30 }"
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
                >
                  提交
                </n-button>
              </n-space>
            </n-col>
          </n-row>
        </n-tab-pane>
        <n-tab-pane name="submission" tab="提交记录" />
      </n-tabs>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss">
.n-layout-content,
.n-layout-sider {
  margin: 20px !important;
}

.description {
  .n-card__content {
    padding: 0 20px !important;
    margin: 0 10px !important;
  }
}
.sample-card {
  .n-card__content {
    padding: 0 !important;
    margin: 0;
  }
  .sample {
    padding: 20px;
  }
}
</style>
