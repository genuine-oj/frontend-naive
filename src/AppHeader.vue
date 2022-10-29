<script setup>
import store from './store';
import router from './router';
import { useRoute } from 'vue-router';
import Axios from '@/plugins/axios';

import { useThemeVars } from 'naive-ui';

const route = useRoute();

const logout = () => {
  Axios.get('/user/logout/').then(() => {
    store.commit('logout');
  });
};
</script>

<template>
  <div style="display: inline-block">
    <n-space size="small">
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'index'"
        :quaternary="route.meta.cate !== 'index'"
        @click="router.push('/')"
      >
        首页
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'problem'"
        :quaternary="route.meta.cate !== 'problem'"
        @click="router.push('/problem/')"
      >
        题库
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'submission'"
        :quaternary="route.meta.cate !== 'submission'"
        @click="router.push('/submission/')"
      >
        提交
      </n-button>
      <n-button size="large" quaternary @click="store.commit('changeTheme')">
        {{ store.state.theme === 'dark' ? '浅色' : '深色' }}
      </n-button>
    </n-space>
  </div>
  <div style="display: inline; float: right">
    <n-space size="small" v-if="!store.getters.loggedIn">
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'login'"
        :quaternary="route.meta.cate !== 'login'"
        @click="router.push('/user/login/')"
      >
        登录
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'register'"
        :quaternary="route.meta.cate !== 'register'"
        @click="router.push('/user/register/')"
      >
        注册
      </n-button>
    </n-space>
    <n-space size="small" v-else>
      <n-popconfirm @positive-click="logout">
        <template #trigger>
          <n-button size="large" quaternary>
            欢迎回来，{{ store.state.user.username }}
          </n-button>
        </template>
        确认要退出登录吗？
      </n-popconfirm>
    </n-space>
  </div>
</template>
