<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NIcon, NTag, NTime } from 'naive-ui';
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
    title: '已加入',
    render(row) {
      return h(
        NIcon,
        {
          style: 'margin-top: 5px; margin-left: 5px',
          size: '20',
          color: '#27AE60',
        },
        { default: () => (row.joined ? h(CheckCircleTwotone) : '') }
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
            router.push({ name: 'contest_detail', params: { id: row.id } });
          },
        },
        { default: () => row.id }
      );
    },
  },
  {
    title: '标题',
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          text: true,
          onClick() {
            router.push({ name: 'contest_detail', params: { id: row.id } });
          },
        },
        { default: () => row.title }
      );
    },
  },
  {
    title: '类型',
    render(row) {
      return h(
        NTag,
        {
          bordered: false,
          type: row.problem_list_mode ? 'info' : 'error',
        },
        { default: () => (row.problem_list_mode ? '题单' : '比赛') }
      );
    },
  },
  {
    title: '开始 / 结束时间',
    render(row) {
      return [
        h(NTime, {
          format: 'yyyy-MM-dd HH:mm',
          time: Number(new Date(row.start_time)),
        }),
        h('span', { style: 'margin: 0 5px' }, ' / '),
        h(NTime, {
          format: 'yyyy-MM-dd HH:mm',
          time: Number(new Date(row.end_time)),
        }),
      ];
    },
  },
];
</script>
<template>
  <n-spin :show="loading">
    <n-data-table :columns="columns" :data="data" :bordered="false" />
  </n-spin>
</template>
