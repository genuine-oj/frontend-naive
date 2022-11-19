<template>
  <div>
    <h1>用户信息</h1>
    <n-form :model="userInfoForm" style="max-width: min(100%, 500px)">
      <n-form-item
        label="密码"
        prop="password"
        v-if="store.state.user.is_staff"
      >
        <n-input
          v-model:value="userInfoForm.password"
          type="password"
          placeholder="请输入（留空则不修改）"
        />
      </n-form-item>
      <n-form-item label="真实姓名" prop="real_name">
        <n-input v-model:value="userInfoForm.real_name" />
      </n-form-item>
      <n-form-item label="邮箱" prop="email">
        <n-input v-model:value="userInfoForm.email" />
      </n-form-item>
      <n-form-item label="头像" prop="avatar">
        <n-input v-model:value="userInfoForm.avatar" />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" @click="submitUserInfo">保存</n-button>
      </n-form-item>
    </n-form>
  </div>

  <n-divider />

  <div v-if="!id">
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
        <n-input
          v-model:value="passwordForm.confirm_password"
          type="password"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="error" @click="changePassword"> 修改 </n-button>
      </n-form-item>
    </n-form>
  </div>

  <n-divider />

  <div v-if="!id">
    <h1>页面设置</h1>
    <p>以下设置保存在本地缓存中，不会同步到云端。</p>
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
      <n-form-item label="句子API接口" name="sentenceApi">
        <n-select
          v-model:value="displayForm.sentenceApi"
          :options="sentenceApiOptions"
          style="min-width: 125px"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" @click="changeDisplaySettings">
          保存
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';
import store from '@/store';
import { useRoute } from 'vue-router';

const route = useRoute(),
  message = useMessage();

const id = ref(route.params.id);

const userInfoForm = ref(
  id.value
    ? {}
    : {
        email: store.state.user.email,
        avatar: store.state.user.avatar,
        real_name: store.state.user.real_name,
      }
);

if (id.value) {
  Axios.get(`/user/${id.value}/`).then(res => {
    userInfoForm.value = res;
  });
}

const submitUserInfo = () => {
  console.log(userInfoForm.value);
  let req;
  if (!id.value) {
    req = Axios.put('/user/info/', userInfoForm.value);
  } else {
    req = Axios.put(`/user/${id.value}/`, userInfoForm.value);
  }
  req.then(res => {
    message.success('保存成功');
    if (!id) store.commit('setUser', res);
  });
};

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
const sentenceApiOptions = [
  { label: '异想之旅亿言', value: 'yxzl' },
  { label: 'Hitokoto - 一言', value: 'hitokoto' },
];

const displayForm = ref({
  ...store.state.displaySettings,
});

const changeDisplaySettings = () => {
  store.commit('setDisplaySettings', displayForm.value);
  message.success('保存成功');
};
</script>
