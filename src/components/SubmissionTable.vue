<script setup>
import { h } from 'vue';
import config from '../config';
import { formatTime, formatSize } from '@/plugins/utils';
import { judgeStatus, noTime, noMemory } from '@/plugins/consts';
import { NButton, NTime } from 'naive-ui';
import { RouterLink } from 'vue-router';

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
        RouterLink,
        { to: { name: 'submission_detail', params: { id: row.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small',
              },
              { default: () => String(row.id) + (row.is_hidden ? '*' : '') }
            ),
        }
      );
    },
  },
  {
    title: '分数',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'submission_detail', params: { id: row.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small',
                color: judgeStatus.getColorClass(row.status),
              },
              { default: () => row.score }
            ),
        }
      );
    },
  },
  {
    title: '状态',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'submission_detail', params: { id: row.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                size: 'small',
                color: judgeStatus.getColorClass(row.status),
              },
              { default: () => judgeStatus.getDisplay(row.status) }
            ),
        }
      );
    },
  },
  {
    title: '题目',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'problem_detail', params: { id: row.problem.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small',
              },
              { default: () => row.problem.title }
            ),
        }
      );
    },
  },
  {
    title: '用户',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'user_detail', params: { id: row.user.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small',
              },
              { default: () => row.user.username }
            ),
        }
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
      return config.languages[row.language];
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

<style lang="scss" scoped>
:deep(a) {
  text-decoration: none;
}
</style>
