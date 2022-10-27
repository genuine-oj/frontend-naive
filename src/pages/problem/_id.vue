<script setup>
import { ref } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import { useRoute } from 'vue-router';
import MdEditor from '@/components/MdEditor.vue';

const route = useRoute();
const id = route.params.id,
  data = ref({});

const loadData = () => {
  Axios.get(`/problem/${id}/`).then(res => {
    data.value = res;
  });
};

loadData();
</script>

<template>
  <n-layout has-sider>
    <n-layout-content>
      <h1>#{{ data.id }}&ensp;{{ data.title }}</h1>

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
      <n-row v-for="item in data.samples" :key="item.index">
        <div v-if="item.input || item.output" style="width: 100%">
          <n-col :span="11">
            <h3>样例输入 #{{ item.index }}</h3>
            <n-card class="sample">
              <n-code :code="item.input" />
            </n-card>
          </n-col>
          <n-col :span="11">
            <h3>样例输出 #{{ item.index }}</h3>
            <n-card class="sample">
              <n-code :code="item.output" />
            </n-card>
          </n-col>
        </div>
      </n-row>
    </n-layout-content>
    <n-layout-sider>
      <n-button strong secondary style="width: 100%" type="info">
        提交
      </n-button>
    </n-layout-sider>
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
  }
}
</style>
