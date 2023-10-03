import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { store } from './store';
import { VueReCaptcha } from 'vue-recaptcha-v3';
import { config, runAfterConfig } from './config';
import '@/assets/style.scss';

const app = createApp(App);
app.use(router).use(store);
runAfterConfig(() => {
  if (config.captcha.enabled) {
    switch (config.captcha.type) {
      case 'recaptcha-v3':
        console.log('reCAPTCHA V3 initialized');
        app.use(VueReCaptcha, {
          siteKey: config.captcha.clientKey,
          loaderOptions: {
            customUrl: 'https://recaptcha.google.cn/recaptcha/api.js',
            autoHideBadge: true,
          },
        });
        break;
    }
  }
});
app.mount('#app');
