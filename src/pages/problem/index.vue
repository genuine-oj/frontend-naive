<script setup>
import { ref, watch, onMounted } from 'vue';
import Axios from '@/plugins/axios';

import router from '@/router';
import store from '@/store';
import { judgeStatus, languages, difficultyOptions } from '@/plugins/consts';
import ProblemTable from '@/components/ProblemTable.vue';
import { useRoute } from 'vue-router';
import { BookmarksOutline, AddOutline } from '@vicons/ionicons5';

const route = useRoute();

const languageOptions = [],
  statusOptions = [],
  tagsOptions = ref([]);

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

Axios.get('/problem/tag/').then(res => {
  tagsOptions.value = res.map(item => ({
    label: item.name,
    value: item.id,
  }));
});

const pagination = ref({ pageSize: 20, page: 1, count: 0 }),
  search = ref(route.query.search),
  difficulty = ref(route.query.difficulty && parseInt(route.query.difficulty)),
  tags = ref((route.query.tag && route.query.tag.split(',')) || []),
  data = ref([]),
  loading = ref(false);
let lastQuery = {};

const getFilterFromPath = () => {
  search.value = route.query.search;
  difficulty.value = route.query.difficulty && parseInt(route.query.difficulty);
  tags.value = (route.query.tag && route.query.tag.split(',')) || [];
  if (
    lastQuery.search !== search.value ||
    lastQuery.difficulty !== difficulty.value ||
    lastQuery.tags !== tags.value.join(',')
  ) {
    pagination.value.page = 1;
    loadData();
  }
};
watch(
  () => route.query,
  () => {
    if (route.name === 'problem_list') {
      getFilterFromPath();
    }
  }
);

const loadData = () => {
  loading.value = true;
  Axios.get('/problem/', {
    params: {
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize,
      search: search.value,
      difficulty: difficulty.value,
      tags__id: tags.value.join(','),
    },
  })
    .then(res => {
      pagination.value.count = res.count;
      data.value = res.results;
      lastQuery = {
        search: search.value,
        difficulty: difficulty.value,
        tags: tags.value.join(','),
      };
    })
    .finally(() => {
      loading.value = false;
    });
};
loadData();
</script>

<template>
  <n-layout>
    <h1 style="display: inline">题目列表</h1>
    <n-layout-content>
      <div style="float: left; display: inline-block">
        <n-form inline>
          <n-form-item>
            <n-input v-model:value="search" @keydown.enter="loadData" />
          </n-form-item>
          <n-form-item>
            <n-select
              v-model:value="tags"
              :options="tagsOptions"
              clearable
              filterable
              multiple
              placeholder="请选择标签"
              style="min-width: 150px"
              :max-tag-count="1"
              :disabled="!tagsOptions.length"
            />
          </n-form-item>
          <n-form-item>
            <n-select
              v-model:value="difficulty"
              :options="
                [{ label: '全部', value: null }].concat(difficultyOptions)
              "
              placeholder="请选择难度"
              style="min-width: 150px"
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="loadData"> 搜索 </n-button>
          </n-form-item>
        </n-form>
      </div>
      <router-link :to="{ name: 'tag_edit' }" v-if="store.state.user.is_staff">
        <n-button style="float: right; margin-top: 25px" type="primary">
          <template #icon>
            <n-icon :component="BookmarksOutline" />
          </template>
          标签管理
        </n-button>
      </router-link>
      <router-link
        :to="{ name: 'problem_create' }"
        v-if="store.state.user.is_staff"
      >
        <n-button
          style="float: right; margin-top: 25px; margin-right: 10px"
          type="primary"
        >
          <template #icon>
            <n-icon :component="AddOutline" />
          </template>
          创建题目
        </n-button>
      </router-link>
    </n-layout-content>
    <n-layout-content>
      <ProblemTable :data="data" :loading="loading" />
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
