<script setup>
import { ref, watch } from 'vue';
import Axios from '@/plugins/axios';

import router from '@/router';
import store from '@/store';
import UserTable from '@/components/UserTable.vue';
import { useRoute } from 'vue-router';
import { AddOutline } from '@vicons/ionicons5';

const route = useRoute();

const pagination = ref({ pageSize: 20, page: 1, count: 0 }),
  search = ref(''),
  data = ref([]),
  loading = ref(false);

watch(
  () => route.query,
  () => {
    if (route.query.search) search.value = route.query.search;
    loadData();
  }
);

const loadData = () => {
  loading.value = true;
  Axios.get('/user/', {
    params: {
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize,
      search: search.value,
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
    <h1 style="display: inline">用户列表</h1>
    <n-layout-content>
      <div style="float: left; display: inline-block">
        <n-form inline>
          <n-form-item>
            <n-input v-model:value="search" @keydown.enter="loadData" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="loadData">搜索</n-button>
          </n-form-item>
        </n-form>
      </div>
      <router-link :to="{ name: 'register' }" v-if="store.state.user.is_staff">
        <n-button style="float: right; margin-top: 25px" type="primary">
          <template #icon>
            <n-icon :component="AddOutline" />
          </template>
          创建用户
        </n-button>
      </router-link>
    </n-layout-content>
    <n-layout-content>
      <UserTable :data="data" :loading="loading" />
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
