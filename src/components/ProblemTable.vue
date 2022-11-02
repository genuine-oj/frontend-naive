<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NIcon, NTag } from 'naive-ui';
import { CheckCircleTwotone } from '@vicons/antd';
import { difficulty, difficultyColor } from '@/plugins/consts';

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
  {
    title: '难度',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          color: difficultyColor[row.difficulty],
          onClick() {
            router.push({
              name: 'problem_list',
              query: { difficulty: row.difficulty },
            });
          },
        },
        { default: () => difficulty[row.difficulty] }
      );
    },
  },
  {
    title: '通过 / 提交人数',
    render(row) {
      return `${row.solved_count} / ${row.submission_count}`;
    },
  },
];
</script>
<template>
  <n-spin :show="loading">
    <n-data-table :columns="columns" :data="data" :bordered="false" />
  </n-spin>
</template>
