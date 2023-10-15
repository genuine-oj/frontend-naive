<template>
  <h1>站点配置</h1>

  <div v-if="!Object.keys(siteSettingsForm).length" style="text-align: center">
    <n-spin show size="large">
      <template #description> 加载配置中... </template>
    </n-spin>
  </div>

  <n-form :model="siteSettingsForm" style="max-width: min(100%, 500px)" v-else>
    <n-form-item label="站点名称" prop="name">
      <n-input v-model:value="siteSettingsForm.name" />
    </n-form-item>
    <n-form-item label="站点标题" prop="title">
      <n-input v-model:value="siteSettingsForm.title" />
    </n-form-item>
    <n-form-item label="启用页脚" name="footer_useFooter">
      <n-switch v-model:value="siteSettingsForm.footer.useFooter" />
    </n-form-item>
    <n-form-item label="ICP备案号" prop="footer_icp">
      <n-input v-model:value="siteSettingsForm.footer.icp" />
    </n-form-item>

    <n-divider />

    <n-form-item label="允许注册" prop="allowRegister">
      <n-switch v-model:value="siteSettingsForm.allowRegister" />
    </n-form-item>
    <n-form-item label="强制隐藏提交" prop="forceHideSubmissions">
      <n-switch v-model:value="siteSettingsForm.forceHideSubmissions" />
    </n-form-item>
    <n-form-item label="启用讨论" prop="enableDiscussion">
      <n-switch v-model:value="siteSettingsForm.enableDiscussion" />
    </n-form-item>

    <n-divider />

    <p style="font-weight: bold">
      增加新的评测语言需要同步修改后端代码，否则新增的语言将无法评测。请在阅读文档后谨慎修改。
    </p>
    <n-form-item label="评测语言" prop="languages">
      <n-dynamic-input
        v-model:value="languages"
        preset="pair"
        key-placeholder="语言标识符"
        value-placeholder="显示名称"
      />
    </n-form-item>
    <n-form-item label="默认提交语言" prop="defaultSubmitLanguage">
      <n-select
        v-model:value="siteSettingsForm.defaultSubmitLanguage"
        :options="defaultSubmitLanguageOptions"
        style="min-width: 125px"
      />
    </n-form-item>

    <n-divider />

    <n-form-item label="启用人机验证" prop="captcha_enabled">
      <n-switch v-model:value="siteSettingsForm.captcha.enabled" />
    </n-form-item>
    <n-form-item label="人机验证服务" name="captcha.type">
      <n-select
        v-model:value="siteSettingsForm.captcha.type"
        :options="captchaTypeOptions"
        style="min-width: 125px"
      />
    </n-form-item>
    <n-form-item label="客户端密钥" prop="captcha_clientKey">
      <n-input v-model:value="siteSettingsForm.captcha.clientKey" />
    </n-form-item>
    <n-form-item label="服务端密钥" prop="captcha_serverKey">
      <n-input v-model:value="siteSettingsForm.captcha.serverKey" />
    </n-form-item>
    <n-form-item label="验证服务后端URL" prop="captcha_backendUrl">
      <n-input
        v-model:value="siteSettingsForm.captcha.backendUrl"
        placeholder="建议你留空，除非你知道自己在干什么"
      />
    </n-form-item>
    <n-form-item label="人机验证场景" prop="captcha_scenes">
      <n-transfer
        v-model:value="siteSettingsForm.captcha.scenes"
        :options="captchaSceneOptions"
      />
    </n-form-item>
    <p>reCAPTCHA V3类型的验证不会展示可见的验证码，验证会自动完成。</p>

    <n-divider />

    <p>
      对于非首次访问站点的用户，本部分配置项当且仅当用户主动在个人设置页更新时才会与本页面的配置同步，否则将继续使用浏览器缓存中的信息。
    </p>
    <n-form-item label="主题" name="displaySettings_theme">
      <n-select
        v-model:value="siteSettingsForm.displaySettings.theme"
        :options="themeOptions"
        style="min-width: 125px"
      />
    </n-form-item>
    <n-form-item label="MarkDown 主题" name="displaySettings_markdownTheme">
      <n-select
        v-model:value="siteSettingsForm.displaySettings.markdownTheme"
        :options="markdownThemeOptions"
        style="min-width: 125px"
      />
    </n-form-item>
    <n-form-item label="句子API接口" name="displaySettings_sentenceApi">
      <n-select
        v-model:value="siteSettingsForm.displaySettings.sentenceApi"
        :options="sentenceApiOptions"
        style="min-width: 125px"
      />
    </n-form-item>

    <n-form-item>
      <n-space>
        <n-button type="primary" @click="submit"> 保存 </n-button>
        <n-popconfirm @positive-click="reset">
          <template #trigger>
            <n-button type="warning"> 重置 </n-button>
          </template>
          您确认要重置所有站点设置为默认值吗？
        </n-popconfirm>
        <n-button @click="refresh"> 清除缓存 </n-button>
      </n-space>
    </n-form-item>
  </n-form>

  <n-divider />

  <h2>说明</h2>
  <p>以上信息将同步至服务器保存。</p>
  <p>
    每当用户访问网站时，都会自动从服务端拉取配置文件并保存至浏览器缓存中。参数会即刻对所有人生效（有特殊标记的除外）。
  </p>
</template>

<script setup>
import Axios from '@/plugins/axios';
import { ref, watch } from 'vue';
import {
  themeOptions,
  markdownThemeOptions,
  sentenceApiOptions,
  captchaTypeOptions,
  captchaSceneOptions,
} from '@/plugins/consts';

const message = useMessage();

const siteSettingsForm = ref({});

let languages = ref([]);
const init = () => {
  Axios.get('/site_settings/').then(res => {
    siteSettingsForm.value = res;
    languages.value = [];
    for (const [key, value] of Object.entries(res.languages)) {
      languages.value.push({ key, value });
    }
  });
};
init();

const submit = () => {
  siteSettingsForm.value.languages = {};
  for (const item of languages.value) {
    siteSettingsForm.value.languages[item.key] = item.value;
  }
  Axios.put(`/site_settings/`, siteSettingsForm.value).then(res => {
    message.success('保存成功，请刷新页面');
  });
};

const reset = () => {
  Axios.delete('/site_settings/').then(() => {
    message.success('重置成功，请刷新页面');
  });
};

const refresh = () => {
  Axios.patch('/site_settings/').then(() => {
    message.success('清除缓存成功，请刷新页面');
  });
};

const defaultSubmitLanguageOptions = ref([]);
watch(languages, () => {
  defaultSubmitLanguageOptions.value = languages.value.map(item => ({
    label: item.value,
    value: item.key,
  }));
});
</script>
