<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import Captcha from '../../components/captcha.vue';
import store from '@/store';
import router from '@/router';
import { useRoute } from 'vue-router';

const message = useMessage(),
  route = useRoute();

const form = ref({
    username: '',
    password: '',
    captcha: '',
  }),
  captchaRef = ref(null);

const login = async () => {
  if (!form.value.username || !form.value.password) {
    message.error('用户名或密码不能为空');
    return;
  }
  if (!(await captchaRef.value.checkCaptcha())) return;
  Axios.post('/user/login/', form.value).then(res => {
    store.commit('setUser', res);
    if (route.query.next) {
      router.push(route.query.next);
    } else {
      router.push({ name: 'home' });
    }
  });
};
</script>

<template>
  <n-card style="max-width: 500px; margin: auto; padding: 20px">
    <h1>用户登录</h1>
    <n-divider></n-divider>
    <n-form>
      <n-form-item label="用户名">
        <n-input
          v-model:value="form.username"
          placeholder="请输入用户名"
          @keydown.enter="login"
        />
      </n-form-item>
      <n-form-item label="密码">
        <n-input
          v-model:value="form.password"
          type="password"
          placeholder="请输入密码"
          @keydown.enter="login"
        />
      </n-form-item>
      <Captcha scene="login" v-model:captcha="form.captcha" ref="captchaRef" />
      <n-form-item>
        <n-button @click="login" style="width: 100%"> 登录 </n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>
