<script setup>
import { ref, watch } from 'vue';
import Axios from '@/plugins/axios';

import { languageOptions, statusOptions } from '@/plugins/consts';
import SubmissionTable from '@/components/SubmissionTable.vue';
import { useRoute } from 'vue-router';
import { _writeSearchToQuery } from '@/plugins/utils';

const route = useRoute();

const pagination = ref({ pageSize: 20, page: 1, count: 0 }),
  search = ref({
    user__username: '',
    problem__id: '',
    language: null,
    status: null,
  }),
  data = ref([]),
  loading = ref(false);
const writeSearchToQuery = _writeSearchToQuery(
  search.value,
  pagination.value,
  route
);

const handleQueryChange = () => {
  if (route.name !== 'submission_list') return;

  for (const key in search.value) {
    if (route.query[key]) {
      let val = route.query[key];
      if (key === 'status') val = parseInt(val);
      search.value[key] = val;
    }
  }
  for (const key in pagination.value) {
    if (route.query[key]) pagination.value[key] = parseInt(route.query[key]);
  }

  loading.value = true;
  Axios.get('/submission/', {
    params: {
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize,
      ...search.value,
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

watch(() => route.query, handleQueryChange);
handleQueryChange();
</script>

<template>
  <n-layout>
    <h1>提交列表</h1>
    <n-layout-content>
      <n-form inline>
        <n-form-item label="用户名称">
          <n-input
            v-model:value="search.user__username"
            @keydown.enter="writeSearchToQuery"
          />
        </n-form-item>
        <n-form-item label="题目ID">
          <n-input
            v-model:value="search.problem__id"
            type="number"
            @keydown.enter="writeSearchToQuery"
          />
        </n-form-item>
        <n-form-item label="语言">
          <n-select
            v-model:value="search.language"
            :options="languageOptions"
            clearable
            style="min-width: 125px"
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="search.status"
            :options="statusOptions"
            clearable
            style="min-width: 125px"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="writeSearchToQuery">搜索</n-button>
        </n-form-item>
      </n-form>
    </n-layout-content>
    <n-layout-content>
      <SubmissionTable :data="data" :loading="loading" />
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
          @update:page="writeSearchToQuery"
          @update:page-size="
            pageSize => {
              pagination.pageSize = pageSize;
              pagination.page = 1;
              writeSearchToQuery();
            }
          "
        />
      </div>
    </n-layout-content>
  </n-layout>
</template>
