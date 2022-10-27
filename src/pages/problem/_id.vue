<script setup>
import { ref } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';
import MdEditor from '@/components/MdEditor.vue';
import Submission from '@/pages/submission/index.vue';

const route = useRoute();
const id = route.params.id,
  data = ref({});

const loadData = () => {
  Axios.get(`/problem/${id}/`).then(res => {
    data.value = res;
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
</script>

<template>
  <h1>#{{ data.id }}&ensp;{{ data.title }}</h1>
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
            <MdEditor :content="data.description" previewOnly />
          </n-card>

          <h2>输入格式</h2>
          <n-card class="description">
            <MdEditor :content="data.input_format" previewOnly />
          </n-card>

          <h2>输出格式</h2>
          <n-card class="description">
            <MdEditor :content="data.output_format" previewOnly />
          </n-card>

          <h2>样例</h2>
          <div
            v-for="item in data.samples"
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
        <n-tab-pane name="提交"> </n-tab-pane>
        <n-tab-pane name="submission" tab="提交记录">
          <Submission />
        </n-tab-pane>
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
