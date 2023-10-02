<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import { difficultyColor } from '@/plugins/consts';
import SubmissionTable from '@/components/SubmissionTable.vue';
import { useRoute } from 'vue-router';
import store from '@/store';

const route = useRoute();

const id = ref(route.params.id),
  data = ref({});

Axios.get(`/user/${id.value}/`).then(res => {
  data.value = res;
});
</script>

<template>
  <n-layout has-sider>
    <n-layout-sider content-style="padding: 24px; text-align: center">
      <n-space vertical>
        <img
          style="width: 70%; margin: auto; display: block; border-radius: 50%"
          :src="
            data.avatar ||
            'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
          "
        />
        <div style="margin-bottom: 18px">
          <h1 style="margin-bottom: 0">{{ data.username }}</h1>
          <p v-if="data.real_name">{{ data.real_name }}</p>
        </div>
        <n-statistic label="通过题目数">
          {{ data.solved_problems && data.solved_problems.length }}
        </n-statistic>
        <n-statistic label="通过 / 提交次数">
          <template #prefix>
            {{ data.accepted_count }}
          </template>
          /
          <template #suffix>
            {{ data.submission_count }}
          </template>
        </n-statistic>
        <router-link
          :to="{ name: 'user_edit', params: { id } }"
          v-if="store.state.user.permissions.includes('user')"
        >
          <n-button type="primary" style="margin-top: 10px">管理</n-button>
        </router-link>
      </n-space>
    </n-layout-sider>
    <n-layout-content content-style="padding: 24px 35px;">
      <div style="margin-bottom: 30px">
        <h2>通过的题目</h2>
        <n-space size="small">
          <n-popover
            trigger="hover"
            v-for="item in data.solved_problems"
            :key="item.problem.id"
          >
            <template #trigger>
              <router-link
                :to="{
                  name: 'problem_detail',
                  params: { id: item.problem.id },
                }"
              >
                <n-button :color="difficultyColor[item.problem.difficulty]">
                  #{{ item.problem.id }} | {{ item.problem.title }}
                </n-button>
              </router-link>
            </template>
            通过时间：<n-time :time="Number(new Date(item.create_time))" />
          </n-popover>
        </n-space>
      </div>
      <div>
        <h2>最近的提交</h2>
        <SubmissionTable :data="data.submissions" />
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
</style>
