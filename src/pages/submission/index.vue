<script setup>
import { ref } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import { judgeStatus, languages } from '@/plugins/consts';
import SubmissionTable from '@/components/SubmissionTable.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const languageOptions = [],
  statusOptions = [];

for (const key in languages) {
  if (typeof languages[key] === 'string') {
    languageOptions.push({
      label: languages.getDisplay(languages[key]),
      value: languages[key],
    });
  }
}
for (const key in judgeStatus) {
  if (typeof judgeStatus[key] === 'number') {
    statusOptions.push({
      label: judgeStatus.getDisplay(judgeStatus[key]),
      value: judgeStatus[key],
    });
  }
}

const pagination = ref({ pageSize: 20, page: 1, count: 0 }),
  search = ref({
    user__username: route.query.user__username ?? '',
    problem__id: route.query.problem__id ?? '',
    language: route.query.language ?? null,
    status: route.query.status ?? null,
  }),
  data = ref([]),
  loading = ref(false);

const loadData = () => {
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

loadData();
</script>

<template>
  <n-layout>
    <h1>提交列表</h1>
    <n-layout-content>
      <n-form inline>
        <n-form-item label="用户名称">
          <n-input v-model:value="search.user__username" />
        </n-form-item>
        <n-form-item label="题目ID">
          <n-input v-model:value="search.problem__id" />
        </n-form-item>
        <n-form-item label="语言">
          <n-select
            v-model:value="search.language"
            :options="languageOptions"
            clearable
            style="min-width: 100px"
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="search.status"
            :options="statusOptions"
            clearable
            style="min-width: 200px"
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="loadData">搜索</n-button>
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
