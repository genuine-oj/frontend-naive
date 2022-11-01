<script setup>
import { h } from 'vue';
import router from '@/router';
import { formatTime, formatSize } from '@/plugins/utils';
import { judgeStatus, languages, noTime, noMemory } from '@/plugins/consts';
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
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick: () => {
            router.push({ name: 'submission_detail', params: { id: row.id } });
          },
        },
        { default: () => row.id }
      );
    },
  },
  {
    title: '分数',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          color: judgeStatus.getColorClass(row.status),
          onClick() {
            router.push({ name: 'submission_detail', params: { id: row.id } });
          },
        },
        { default: () => row.score }
      );
    },
  },
  {
    title: '状态',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          color: judgeStatus.getColorClass(row.status),
          onClick() {
            router.push({ name: 'submission_detail', params: { id: row.id } });
          },
        },
        { default: () => judgeStatus.getDisplay(row.status) }
      );
    },
  },
  {
    title: '题目',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick() {
            router.push({
              name: 'problem_detail',
              params: { id: row.problem.id },
            });
          },
        },
        { default: () => row.problem.title }
      );
    },
  },
  {
    title: '用户',
    render(row) {
      return h(
        NButton,
        {
          text: true,
          size: 'small',
          onClick: () => {
            router.push({
              name: 'submission_list',
              query: { user__username: row.user.username },
            });
          },
        },
        { default: () => row.user.username }
      );
    },
  },
  {
    title: '用时',
    render(row) {
      return noTime.includes(row.status) ? '-' : formatTime(row.execute_time);
    },
  },
  {
    title: '内存',
    render(row) {
      return noMemory.includes(row.status)
        ? '-'
        : formatSize(row.execute_memory);
    },
  },
  {
    title: '语言',
    render(row) {
      return languages.getDisplay(row.language);
    },
  },
  {
    title: '提交时间',
    render(row) {
      return h(NTime, {
        time: new Date(row.create_time),
      });
    },
  },
];
</script>
<template>
  <n-spin :show="loading">
    <n-data-table :columns="columns" :data="data" :bordered="false" />
  </n-spin>
</template>
