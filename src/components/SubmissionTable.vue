<script setup>
import { h } from 'vue';
import router from '@/router';
import { formatTime, formatSize } from '@/plugins/utils';
import { judgeStatus, languages } from '@/plugins/consts';
import { NButton, NTime } from 'naive-ui';

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
    title: 'ID',
    key: 'id',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick: () => {
            router.push(`/submission/${row.id}/`);
          },
        },
        { default: () => row.id }
      );
    },
  },
  {
    title: '分数',
    key: 'score',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          color: judgeStatus.getColorClass(row.status),
          onClick() {
            router.push(`/submission/${row.id}/`);
          },
        },
        { default: () => row.score }
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          color: judgeStatus.getColorClass(row.status),
          onClick() {
            router.push(`/submission/${row.id}/`);
          },
        },
        { default: () => judgeStatus.getDisplay(row.status) }
      );
    },
  },
  {
    title: '题目',
    key: 'problem',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick() {
            router.push(`/problem/${row.problem.id}/`);
          },
        },
        { default: () => row.problem.title }
      );
    },
  },
  {
    title: '用户',
    key: 'user',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick: () => {
            router.push(`/user/${row.user.id}/`);
          },
        },
        { default: () => row.user.username }
      );
    },
  },
  {
    title: '用时',
    key: 'execute_time',
    render(row) {
      return row.status !== judgeStatus.TIME_LIMIT_EXCEEDED
        ? formatTime(row.execute_time)
        : '-';
    },
  },
  {
    title: '内存',
    key: 'execute_memory',
    render(row) {
      return row.status !== judgeStatus.MEMORY_LIMIT_EXCEEDED
        ? formatSize(row.execute_memory)
        : '-';
    },
  },
  {
    title: '语言',
    key: 'language',
    render(row) {
      return languages.getDisplay(row.language);
    },
  },
  {
    title: '提交时间',
    key: 'created_at',
    render(row) {
      return h(NTime, { value: row.created_at });
    },
  },
];
</script>
<template>
  <n-spin :show="loading">
    <n-data-table :columns="columns" :data="data" :bordered="false" />
  </n-spin>
</template>
