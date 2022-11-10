<script setup>
import { h } from 'vue';
import router from '@/router';
import store from '@/store';
import { NButton, NIcon, NSpace, NAvatar } from 'naive-ui';
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
  // {
  //   title: '',
  //   render(row) {
  //     return h(
  //       NIcon,
  //       {
  //         style: 'margin-top: 5px; margin-left: 5px',
  //         size: '20',
  //         color: '#27AE60',
  //       },
  //       { default: () => (row.joined ? h(CheckCircleTwotone) : '') }
  //     );
  //   },
  //   width: 100,
  // },
  {
    title: 'ID',
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
              { default: () => row.id }
            ),
        }
      );
    },
  },
  {
    title: '用户名',
    render(row) {
      return h(
        RouterLink,
        { to: { name: 'user_detail', params: { id: row.id } } },
        {
          default: () =>
            h(
              NSpace,
              {
                style: {
                  display: 'inline-flex',
                },
              },
              {
                default: () => [
                  row.avatar
                    ? h(NAvatar, {
                        src: row.avatar,
                        size: 'small',
                        round: true,
                      })
                    : null,
                  h(
                    NButton,
                    {
                      text: true,
                      size: 'small',
                      style: {
                        marginTop: '6px',
                      },
                    },
                    { default: () => row.username }
                  ),
                ],
              }
            ),
        }
      );
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
