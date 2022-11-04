<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NTime, NPopover, NSpace } from 'naive-ui';
import { CheckCircleTwotone } from '@vicons/antd';
import { judgeStatus } from '@/plugins/consts';

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
        NButton,
        {
          text: true,
          size: 'small',
          onClick: () => {
            // TODO
            return;
            router.push({
              name: 'submission_list',
              query: { user__username: row.user.username },
            });
          },
        },
        { default: () => row.username }
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
            for (const key in row.problems) {
              res.push(
                h(
                  NPopover,
                  {
                    trigger: 'hover',
                  },
                  {
                    trigger: () =>
                      h(
                        NButton,
                        {
                          size: 'small',
                          color: judgeStatus.getColorClass(
                            row.problems[key].status
                          ),
                          onClick() {
                            router.push({
                              name: 'submission_detail',
                              params: { id: row.problems[key].submission_id },
                            });
                          },
                        },
                        { default: () => props.data.problems[key] }
                      ),
                    default: () => [
                      `分数：${row.problems[key].score}`,
                      h('br'),
                      `状态：${judgeStatus.getDisplay(
                        row.problems[key].status
                      )}`,
                      h('br'),
                      '时间：',
                      h(NTime, {
                        time: Number(new Date(row.problems[key].time)),
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
