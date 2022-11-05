<template>
  <h1>修改密码</h1>
  <n-form :model="form" :rules="rules" :label-width="80">
    <n-form-item label="旧密码" name="old_password">
      <n-input v-model:value="form.old_password" type="password" />
    </n-form-item>
    <n-form-item label="新密码" name="new_password">
      <n-input v-model:value="form.new_password" type="password" />
    </n-form-item>
    <n-form-item label="确认密码" name="confirm_password">
      <n-input v-model:value="form.confirm_password" type="password" />
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="changePassword">修改</n-button>
    </n-form-item>
  </n-form>
</template>

<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';

const message = useMessage();

const form = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
});

const rules = ref({
  old_password: [
    {
      required: true,
      message: '请输入旧密码',
    },
  ],
  new_password: [
    {
      required: true,
      message: '请输入新密码',
    },
  ],
  confirm_password: [
    {
      required: true,
      message: '请确认密码',
      validator: (rule, value) => {
        if (value !== form.value.new_password) {
          return Promise.reject('两次密码不一致');
        }
        return Promise.resolve();
      },
    },
  ],
});

const changePassword = () => {
  Axios.post('/user/change_password/', {
    old_password: form.value.old_password,
    new_password: form.value.new_password,
  }).then(res => {
    message.success('修改成功');
  });
};
</script>
