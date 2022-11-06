<script setup>
import { h } from 'vue';
import store from './store';
import router from './router';
import { useRoute } from 'vue-router';
import Axios from '@/plugins/axios';
import { NIcon } from 'naive-ui';
import {
  UserOutlined,
  UserAddOutlined,
  HomeOutlined,
  HourglassOutlined,
} from '@vicons/antd';
import {
  LogOutOutline,
  SettingsOutline,
  LogInOutline,
  BookOutline,
  TrophyOutline,
  SunnyOutline,
  MoonOutline,
} from '@vicons/ionicons5';

const route = useRoute();

const renderIcon = icon => {
  return () =>
    h(NIcon, null, {
      default: () => h(icon),
    });
};

const userOptions = [
  {
    label: '个人主页',
    key: 'user_page',
    icon: renderIcon(UserOutlined),
    disabled: true,
  },
  {
    label: '设置',
    key: 'user_settings',
    icon: renderIcon(SettingsOutline),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline),
  },
];
const handleUserOptionSelect = key => {
  if (key === 'logout') {
    Axios.get('/user/logout/').then(() => {
      store.commit('logout');
      router.push({ name: 'login' });
    });
  } else {
    router.push({ name: key });
  }
};
</script>

<template>
  <div style="display: inline-block">
    <n-space size="small">
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'home'"
        :quaternary="route.meta.cate !== 'home'"
        @click="router.push({ name: 'home' })"
      >
        <template #icon>
          <n-icon :component="HomeOutlined" />
        </template>
        首页
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'problem'"
        :quaternary="route.meta.cate !== 'problem'"
        @click="router.push({ name: 'problem_list' })"
      >
        <template #icon>
          <n-icon :component="BookOutline" />
        </template>
        题目
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'contest'"
        :quaternary="route.meta.cate !== 'contest'"
        @click="router.push({ name: 'contest_list' })"
      >
        <template #icon>
          <n-icon :component="TrophyOutline" />
        </template>
        比赛
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'submission'"
        :quaternary="route.meta.cate !== 'submission'"
        @click="router.push({ name: 'submission_list' })"
      >
        <template #icon>
          <n-icon :component="HourglassOutlined" />
        </template>
        提交
      </n-button>
      <n-button size="large" quaternary @click="store.commit('changeTheme')">
        <template #icon>
          <n-icon
            :component="
              store.state.theme === 'dark' ? SunnyOutline : MoonOutline
            "
          />
        </template>
        {{ store.state.theme === 'dark' ? '浅色' : '深色' }}
      </n-button>
    </n-space>
  </div>
  <div style="display: inline; float: right">
    <n-space size="small" v-if="!store.getters.loggedIn">
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'register'"
        :quaternary="route.meta.cate !== 'register'"
        @click="router.push('/user/register/')"
      >
        <template #icon>
          <n-icon :component="UserAddOutlined" />
        </template>
        注册
      </n-button>
      <n-button
        size="large"
        :tertiary="route.meta.cate === 'login'"
        :quaternary="route.meta.cate !== 'login'"
        @click="router.push({ name: 'login' })"
      >
        <template #icon>
          <n-icon :component="LogInOutline" />
        </template>
        登录
      </n-button>
    </n-space>
    <n-space size="small" v-else>
      <n-dropdown
        trigger="hover"
        :options="userOptions"
        size="large"
        @select="handleUserOptionSelect"
      >
        <n-button
          size="large"
          :tertiary="route.meta.cate === 'user'"
          :quaternary="route.meta.cate !== 'user'"
        >
          欢迎回来，{{ store.state.user.username }}
        </n-button>
      </n-dropdown>
    </n-space>
  </div>
</template>
