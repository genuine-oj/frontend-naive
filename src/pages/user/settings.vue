<template>
  <h1>修改密码</h1>
  <n-form
    :model="passwordForm"
    :rules="passwordRules"
    :label-width="80"
    style="max-width: min(100%, 500px)"
  >
    <n-form-item label="旧密码" name="old_password">
      <n-input v-model:value="passwordForm.old_password" type="password" />
    </n-form-item>
    <n-form-item label="新密码" name="new_password">
      <n-input v-model:value="passwordForm.new_password" type="password" />
    </n-form-item>
    <n-form-item label="确认密码" name="confirm_password">
      <n-input v-model:value="passwordForm.confirm_password" type="password" />
    </n-form-item>
    <n-form-item>
      <n-button type="error" @click="changePassword" size="large">
        修改
      </n-button>
    </n-form-item>
  </n-form>

  <n-divider />

  <h1>页面设置</h1>
  <n-form
    :model="displayForm"
    :label-width="80"
    style="max-width: min(100%, 500px)"
  >
    <n-form-item label="MarkDown 主题" name="markdownTheme">
      <n-select
        v-model:value="displayForm.markdownTheme"
        :options="markdownThemeOptions"
        style="min-width: 125px"
      />
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="changeDisplaySettings" size="large">
        保存
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';
import store from '@/store';

const message = useMessage();

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
});

const passwordRules = ref({
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
        if (value !== passwordForm.value.new_password) {
          return Promise.reject('两次密码不一致');
        }
        return Promise.resolve();
      },
    },
  ],
});

const changePassword = () => {
  Axios.post('/user/change_password/', {
    old_password: passwordForm.value.old_password,
    new_password: passwordForm.value.new_password,
  }).then(res => {
    message.success('修改成功');
  });
};

const markdownThemeOptions = [
  { label: 'default', value: 'default' },
  { label: 'github', value: 'github' },
  { label: 'vuepress', value: 'vuepress' },
  { label: 'mk-cute', value: 'mk-cute' },
  { label: 'smart-blue', value: 'smart-blue' },
  { label: 'cyanosis', value: 'cyanosis' },
  { label: 'arknights', value: 'arknights' },
];

const displayForm = ref({
  markdownTheme: store.state.displaySettings.markdownTheme,
});

const changeDisplaySettings = () => {
  store.commit('setDisplaySettings', displayForm.value);
  message.success('保存成功');
};
</script>
