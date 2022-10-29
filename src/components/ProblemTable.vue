<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NIcon, NTime } from 'naive-ui';
import { CheckCircleTwotone } from '@vicons/antd';

defineProps({
  data: {
    type: Array,
    default: [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const columns = [
  {
    title: '已通过',
    key: 'solved',
    render(row) {
      return h(
        NIcon,
        {
          style: 'margin-top: 5px; margin-left: 5px',
          size: '20',
          color: '#27AE60',
          onClick() {
            if (row.solved) {
              router.push({
                name: 'submission_index',
                query: { user__username: store.state.user.username },
              });
            }
          },
        },
        { default: () => (row.solved ? h(CheckCircleTwotone) : '') }
      );
    },
    width: 100,
  },
  {
    title: 'ID',
    key: 'id',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick: () => {
            router.push({ name: 'problem_detail', params: { id: row.id } });
          },
        },
        { default: () => row.id }
      );
    },
  },
  {
    title: '名称',
    key: 'title',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          text: true,
          onClick() {
            router.push({ name: 'problem_detail', params: { id: row.id } });
          },
        },
        { default: () => row.title }
      );
    },
  },
];
</script>
<template>
  <n-spin :show="loading">
    <n-data-table :columns="columns" :data="data" :bordered="false" />
  </n-spin>
</template>
