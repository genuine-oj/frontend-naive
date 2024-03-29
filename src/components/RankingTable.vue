<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NTime, NPopover, NSpace } from 'naive-ui';
import { CheckCircleTwotone } from '@vicons/antd';
import { judgeStatus } from '@/plugins/consts';
import { RouterLink } from 'vue-router';

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const columns = [
  {
    title: '名次',
    render(row, index) {
      return `# ${index + 1}`;
    },
    width: 100,
  },
  {
    title: '用户',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'user_detail', params: { id: row.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small',
              },
              { default: () => row.username }
            ),
        }
      );
    },
  },
  {
    title: '总分',
    key: 'score',
  },
  {
    title: '提交过的题目',
    render(row) {
      return h(
        NSpace,
        {},
        {
          default: () => {
            const res = [];
            for (const item of row.problems) {
              res.push(
                h(
                  NPopover,
                  {
                    trigger: 'hover',
                  },
                  {
                    trigger: () =>
                      h(
                        RouterLink,
                        {
                          to: {
                            name: 'submission_detail',
                            params: { id: item.submission_id },
                          },
                        },
                        h(
                          NButton,
                          {
                            size: 'small',
                            color: judgeStatus.getColorClass(item.status),
                          },
                          { default: () => item.title }
                        )
                      ),
                    default: () => [
                      `分数：${item.score}`,
                      h('br'),
                      `状态：${judgeStatus.getDisplay(item.status)}`,
                      h('br'),
                      '时间：',
                      h(NTime, {
                        time: Number(new Date(item.time)),
                      }),
                    ],
                  }
                )
              );
            }
            return res;
          },
        }
      );
    },
  },
];
</script>

<template>
  <n-spin :show="loading">
    <n-data-table :columns="columns" :data="data.users" :bordered="false" />
  </n-spin>
</template>

<style lang="scss" scoped>
:deep(a) {
  text-decoration: none;
}
</style>
