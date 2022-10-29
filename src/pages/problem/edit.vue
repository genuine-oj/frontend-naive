<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import EditData from './edit/data.vue';
import EditDetail from './edit/detail.vue';

const route = useRoute(),
  message = useMessage();
const id = ref(route.params.id);
</script>

<template>
  <h1>{{ id ? '编辑' : '创建' }}题目 {{ id ? ` #${id}` : '' }}</h1>
  <n-tabs type="line" animated>
    <n-tab-pane name="detail" tab="详情" display-directive="show:lazy">
      <EditDetail />
    </n-tab-pane>
    <n-tab-pane name="data" tab="数据" display-directive="show:lazy" v-if="id">
      <EditData />
    </n-tab-pane>
  </n-tabs>
</template>
