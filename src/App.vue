<script setup>
import AppHeader from './AppHeader.vue';
import NaiveMessage from './plugins/naiveMessage.vue';
import config from '../config';
import { darkTheme, zhCN, dateZhCN } from 'naive-ui';
import store from './store';
import router from './router';
import { useRoute } from 'vue-router';

const open = url => {
  window.open(url, '_blank');
};
const route = useRoute();
</script>

<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="store.state.theme === 'dark' ? darkTheme : null"
  >
    <n-global-style />

    <n-message-provider>
      <NaiveMessage />
      <n-notification-provider>
        <n-layout style="min-height: 100vh">
          <!-- Header -->
          <n-layout-header bordered>
            <AppHeader />
          </n-layout-header>

          <!-- Body -->
          <n-layout has-sider style="padding: 50px 7%">
            <RouterView />
          </n-layout>

          <!-- Footer -->
          <n-layout-footer style="text-align: center" v-if="config.useFooter">
            {{ config.name }} Powered By Genuine-oj. &nbsp;
            <n-button
              text
              v-if="config.footer.icp"
              @click="open('https://beian.miit.gov.cn/')"
            >
              {{ config.footer.icp }}
            </n-button>
          </n-layout-footer>
        </n-layout>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.n-layout-header {
  padding: 15px;
}

.n-layout-footer {
  width: 100%;
  height: 45px;
  padding: 10px;
  position: absolute;
  bottom: 0;
}
.n-layout {
  padding-bottom: 45px;
}
</style>