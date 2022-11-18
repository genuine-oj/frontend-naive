<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import EditData from './edit/data.vue';
import EditDetail from './edit/detail.vue';

const route = useRoute(),
  message = useMessage();
const id = ref(route.params.id);
</script>

<template>
  <h1>
    <n-space style="align-items: center" size="large">
      {{ id ? '编辑' : '创建' }}题目 {{ id ? ` #${id}` : '' }}
      <n-button
        v-if="id"
        @click="router.push({ name: 'problem_detail', params: { id } })"
        style="display: flex; align-items: center"
      >
        返回
      </n-button>
    </n-space>
  </h1>
  <n-tabs type="line" animated>
    <n-tab-pane name="detail" tab="详情" display-directive="show">
      <EditDetail />
    </n-tab-pane>
    <n-tab-pane name="data" tab="数据" display-directive="show" v-if="id">
      <EditData />
    </n-tab-pane>
  </n-tabs>
</template>
