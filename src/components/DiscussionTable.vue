<script setup>
import { h } from 'vue';
import { NButton, NIcon, NTag, NTime } from 'naive-ui';
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
        { to: { name: 'discussion_detail', params: { id: row.id } } },
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
        { to: { name: 'discussion_detail', params: { id: row.id } } },
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
    title: '作者',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'user_detail', params: { id: row.author.id } } },
        {
          default: () =>
            h(
              NButton,
              {
                text: true,
                size: 'small',
              },
              { default: () => row.author.username }
            ),
        }
      );
    },
  },
  {
    title: '关联内容',
    render(row) {
      if (row.related_problem) {
        return h(
          RouterLink,
          {
            to: {
              name: 'problem_detail',
              params: { id: row.related_problem.id },
            },
          },
          {
            default: () =>
              h(
                NButton,
                {
                  text: true,
                  size: 'small',
                },
                {
                  default: () => row.related_problem.title,
                }
              ),
          }
        );
      } else if (row.related_contest) {
        return h(
          RouterLink,
          {
            to: {
              name: 'contest_detail',
              params: { id: row.related_contest.id },
            },
          },
          {
            default: () =>
              h(
                NButton,
                {
                  text: true,
                  size: 'small',
                },
                { default: () => row.related_contest.title }
              ),
          }
        );
      }
      return '-';
    },
  },
  {
    title: '回复数',
    render(row) {
      return row.reply_count;
    },
  },
  {
    title: '最近回复时间',
    render(row) {
      return h(NTime, {
        time: new Date(row.latest_reply_time),
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
