<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NIcon } from 'naive-ui';
import { CheckCircleTwotone } from '@vicons/antd';
import { difficulty, difficultyColor } from '@/plugins/consts';
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
        RouterLink,
        { to: { name: 'problem_detail', params: { id: row.id } } },
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
    title: '标题',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'problem_detail', params: { id: row.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                size: 'small',
                text: true,
              },
              { default: () => row.title }
            ),
        }
      );
    },
  },
  {
    title: '难度',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'problem_list', query: { difficulty: row.difficulty } } },
        {
          default: () =>
            h(
              NButton,
              {
                size: 'small',
                color: difficultyColor[row.difficulty],
              },
              { default: () => difficulty[row.difficulty] }
            ),
        }
      );
    },
  },
  {
    title: '通过 / 提交次数',
    render(row) {
      return `${row.accepted_count} / ${row.submission_count}`;
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
