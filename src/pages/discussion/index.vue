<script setup>
import { ref, watch } from 'vue';
import Axios from '@/plugins/axios';
import { AddOutline } from '@vicons/ionicons5';
import DiscussionTable from '@/components/DiscussionTable.vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import { _writeSearchToQuery } from '@/plugins/utils';

const route = useRoute();

const pagination = ref({ pageSize: 20, page: 1, count: 0 }),
  search = ref({
    search: route.query.search ?? '',
    related_problem__id: route.query.related_problem__id ?? '',
    related_contest__id: route.query.related_contest__id ?? '',
    author__username: route.query.author__username ?? '',
  }),
  data = ref([]),
  loading = ref(false);
const writeSearchToQuery = _writeSearchToQuery(
  search.value,
  pagination.value,
  route
);

const handleQueryChange = () => {
  if (route.name !== 'discussion_list') return;

  for (const key in search.value) {
    search.value[key] = route.query[key] ?? '';
  }
  for (const key in pagination.value) {
    if (route.query[key]) pagination.value[key] = parseInt(route.query[key]);
  }

  loading.value = true;
  Axios.get('/discussion/', {
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

const createDiscussion = () => {
  const query = {};
  if (search.value.related_problem__id)
    query.related_problem__id = search.value.related_problem__id;
  else if (search.value.related_contest__id)
    query.related_contest__id = search.value.related_contest__id;
  router.push({ name: 'discussion_create', query });
};
</script>

<template>
  <n-layout>
    <h1>讨论列表</h1>
    <n-layout-content>
      <div style="display: inline-block">
        <n-form inline>
          <n-form-item label="标题">
            <n-input
              v-model:value="search.search"
              @keydown.enter="writeSearchToQuery"
            />
          </n-form-item>
          <n-form-item label="关联题目ID">
            <n-input
              v-model:value="search.related_problem__id"
              type="number"
              @keydown.enter="writeSearchToQuery"
            />
          </n-form-item>
          <n-form-item label="关联比赛/题单ID">
            <n-input
              v-model:value="search.related_contest__id"
              type="number"
              @keydown.enter="writeSearchToQuery"
            />
          </n-form-item>
          <n-form-item label="作者用户名称">
            <n-input
              v-model:value="search.author__username"
              @keydown.enter="writeSearchToQuery"
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="writeSearchToQuery">搜索</n-button>
          </n-form-item>
        </n-form>
      </div>
      <n-button
        style="float: right; margin-top: 25px; margin-right: 10px"
        type="primary"
        @click="createDiscussion"
      >
        <template #icon>
          <n-icon :component="AddOutline" />
        </template>
        创建讨论
      </n-button>
    </n-layout-content>
    <n-layout-content>
      <DiscussionTable :data="data" :loading="loading" />
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
