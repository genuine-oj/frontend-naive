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
          type: row.problem_list_mode ? '' : 'info',
        },
        { default: () => (row.problem_list_mode ? '题单' : '比赛') }
      );
    },
  },
  {
    title: '开始 / 结束时间',
    render(row) {
      const start_time = new Date(row.start_time),
        end_time = new Date(row.end_time),
        current_time = new Date();
      const start = Number(start_time),
        end = Number(end_time),
        current = Number(current_time);
      const startYear = start_time.getFullYear(),
        endYear = end_time.getFullYear(),
        currentYear = current_time.getFullYear();
      const racing = start < current && current < end,
        sameStartYear = startYear === currentYear,
        sameEndYear = endYear === currentYear;
      return [
        h(NTime, {
          format: sameStartYear ? 'MM-dd HH:mm' : 'yyyy-MM-dd HH:mm',
          time: start,
        }),
        h('span', { style: 'margin: 0 5px' }, '~'),
        h(NTime, {
          format: sameEndYear ? 'MM-dd HH:mm' : 'yyyy-MM-dd HH:mm',
          time: end,
        }),
        racing
          ? h(
              NTag,
              { type: 'success', bordered: false, style: 'margin-left: 5px' },
              { default: () => '进行中' }
            )
          : start > current
          ? h(
              NTag,
              { type: 'warning', bordered: false, style: 'margin-left: 5px' },
              { default: () => '未开始' }
            )
          : h(
              NTag,
              { type: 'error', bordered: false, style: 'margin-left: 5px' },
              { default: () => '已结束' }
            ),
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