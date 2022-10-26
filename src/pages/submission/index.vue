<script setup>
import { h, ref, reactive } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import { NButton, NTime } from 'naive-ui';

const message = useMessage();

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
            router.push(`/problem/${row.id}`);
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
          onClick() {
            router.push(`/user/${row.id}`);
          },
        },
        { default: () => row.score }
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
            router.push(`/problem/${row.problem.id}`);
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
            router.push(`/user/${row.user.id}`);
          },
        },
        { default: () => row.user.username }
      );
    },
  },
  {
    title: '提交时间',
    key: 'create_time',
    render(row) {
      return h(NTime, { time: new Date(row.create_time) });
    },
  },
];

const pagination = ref({ pageSize: 20, page: 1, count: 0 }),
  data = ref([]),
  loading = ref(false);
const loadData = () => {
  loading.value = true;
  Axios.get('/submission/', {
    params: {
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize,
    },
  })
    .then(res => {
      pagination.value.count = res.count;
      data.value = res.results;
    })
    .finally(() => {
      loading.value = false;
    });
};

loadData();
</script>

<template>
  <n-layout>
    <h1>提交记录</h1>
    <n-layout-content>
      <n-spin :show="loading">
        <n-data-table
          remote
          :columns="columns"
          :data="data"
          :bordered="false"
        />
      </n-spin>
    </n-layout-content>
    <n-layout-content>
      <div style="margin-top: 30px; text-align: center">
        <n-pagination
          v-model:page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :item-count="pagination.count"
          show-size-picker
          show-quick-jumper
          :page-sizes="[10, 20, 50]"
          @update:page="loadData"
          @update:page-size="
            pageSize => {
              pagination.pageSize = pageSize;
              pagination.page = 1;
              loadData();
            }
          "
        />
      </div>
    </n-layout-content>
  </n-layout>
</template>
