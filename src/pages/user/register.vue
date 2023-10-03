<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import store from '@/store';
import router from '@/router';
import { useRoute } from 'vue-router';
import Captcha from '../../components/captcha.vue';

const message = useMessage(),
  route = useRoute();

const form = ref({
    username: '',
    password: '',
    re_password: '',
    captcha: '',
  }),
  captchaRef = ref(null);

const register = async () => {
  if (!form.value.username || !form.value.password) {
    message.error('用户名或密码不能为空');
    return;
  } else if (form.value.password !== form.value.re_password) {
    message.error('两次密码不一致');
    return;
  }

  if (!(await captchaRef.value.checkCaptcha())) return;
  Axios.post('/user/register/', form.value).then(res => {
    message.success('注册成功');
    if (store.getters.loggedIn) {
      router.push({ name: 'user_edit', params: { id: res.id } });
    } else {
      store.commit('setUser', res);
      if (route.query.next) {
        router.push(route.query.next);
      } else {
        router.push({ name: 'home' });
      }
    }
  });
};
</script>

<template>
  <n-card style="max-width: 500px; margin: auto; padding: 20px">
    <h1>用户注册</h1>
    <n-divider></n-divider>
    <n-form>
      <n-form-item label="用户名">
        <n-input
          v-model:value="form.username"
          placeholder="请输入用户名"
          @keydown.enter="register"
        />
      </n-form-item>
      <n-form-item label="密码">
        <n-input
          v-model:value="form.password"
          type="password"
          placeholder="请输入密码"
          @keydown.enter="register"
        />
      </n-form-item>
      <n-form-item label="重复密码">
        <n-input
          v-model:value="form.re_password"
          type="password"
          placeholder="请输入密码"
          @keydown.enter="register"
        />
      </n-form-item>
      <Captcha
        scene="register"
        v-model:captcha="form.captcha"
        ref="captchaRef"
      />
      <n-form-item>
        <n-button @click="register" style="width: 100%"> 注册 </n-button>
      </n-form-item>
    </n-form>
  </n-card>
</template>
