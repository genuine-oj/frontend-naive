<template>
  <div>
    <h1>用户信息</h1>

    <n-form :model="userInfoForm" style="max-width: min(100%, 500px)">
      <n-form-item label="用户名" prop="username" v-if="id">
        <n-input :value="userInfoForm.username" disabled />
      </n-form-item>
      <n-form-item label="密码" prop="password" v-if="id">
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
      <n-form-item label="管理员权限" name="permissions" v-if="id">
        <n-transfer
          v-model:value="userInfoForm.permissions"
          :options="permissionOptions"
        />
      </n-form-item>
      <n-form-item>
        <n-space>
          <n-button type="primary" @click="submitUserInfo" size="large">
            保存
          </n-button>
          <n-popconfirm @positive-click="deleteUser" v-if="id">
            <template #trigger>
              <n-button type="error" size="large"> 删除用户 </n-button>
            </template>
            您确认要删除用户 {{ userInfoForm.username }} 吗？该操作不可撤销。
          </n-popconfirm>
        </n-space>
      </n-form-item>
    </n-form>
  </div>

  <n-divider v-if="!id" />

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
      <n-form-item label="主题" name="theme">
        <n-select
          v-model:value="displayForm.theme"
          :options="themeOptions"
          style="min-width: 125px"
        />
      </n-form-item>
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
      <n-form-item label="默认提交语言" name="defaultSubmitLanguage">
        <n-select
          v-model:value="displayForm.defaultSubmitLanguage"
          :options="
            [
              {
                label: `跟随上次提交（${
                  config.languages[store.state.lastSubmitLanguage]
                }）`,
                value: '__last__',
              },
            ].concat(languageOptions)
          "
          style="min-width: 125px"
        />
      </n-form-item>
      <n-form-item>
        <n-space>
          <n-button type="primary" @click="changeDisplaySettings">
            保存
          </n-button>
          <n-popconfirm @positive-click="resetDisplaySettings">
            <template #trigger>
              <n-button type="warning"> 重置 </n-button>
            </template>
            您确认要重置页面设置为站点默认值吗？
          </n-popconfirm>
        </n-space>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';
import store from '@/store';
import router from '../../router';
import config from '../../config';
import { useRoute } from 'vue-router';
import {
  themeOptions,
  markdownThemeOptions,
  sentenceApiOptions,
  permissionOptions,
  languageOptions,
} from '@/plugins/consts';

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
} else {
  Axios.get('/user/info/').then(res => {
    userInfoForm.value = res;
    store.commit('setUser', res);
  });
}

const submitUserInfo = () => {
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

const deleteUser = () => {
  Axios.delete(`/user/${id.value}/`).then(() => {
    message.success('删除成功！');
    router.push({ name: 'user_list' });
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
    router.push({ name: 'login' });
  });
};

const displayForm = ref({
  ...store.state.displaySettings,
});

const changeDisplaySettings = () => {
  store.commit('setDisplaySettings', displayForm.value);
  message.success('保存成功');
};

const resetDisplaySettings = () => {
  store.commit('setDisplaySettings', config.displaySettings);
  window.location.reload();
};
</script>
