<script setup>
import AppHeader from './AppHeader.vue';
import NaiveMessage from './plugins/naiveMessage.vue';
import config from '../config';
import { darkTheme, zhCN, dateZhCN } from 'naive-ui';
import store from './store';
import router from './router';
import { useRoute } from 'vue-router';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('python', python);
hljs.registerLanguage('python3', python);

const route = useRoute();
</script>

<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="store.state.theme === 'dark' ? darkTheme : null"
    :hljs="hljs"
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
          <div style="padding: 30px 7%">
            <RouterView />
          </div>

          <!-- Footer -->
          <n-layout-footer style="text-align: center" v-if="config.useFooter">
            {{ config.name }} Powered By
            <a
              href="https://github.com/genuine-oj/"
              target="_blank"
              style="text-decoration: none; color: var(--n-text-color)"
            >
              <n-button text>Genuine-OJ</n-button></a
            >. &nbsp;
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              style="text-decoration: none"
              v-if="config.footer.icp"
            >
              <n-button text>
                {{ config.footer.icp }}
              </n-button>
            </a>
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
