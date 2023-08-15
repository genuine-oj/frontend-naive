<template>
  <h1>站点配置</h1>

  <div v-if="!Object.keys(siteSettingsForm).length" style="text-align: center">
    <n-spin show size="large">
      <template #description> 加载配置中... </template>
    </n-spin>
  </div>

  <n-form :model="siteSettingsForm" style="max-width: min(100%, 500px)" v-else>
    <n-form-item label="站点名称" prop="name">
      <n-input :value="siteSettingsForm.name" />
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

    <p style="font-weight: bold">该分区中的设置需要同时在服务端设置环境变量并重启服务端方可生效。</p>
    <n-form-item label="允许注册" prop="allowRegister">
      <n-switch v-model:value="siteSettingsForm.allowRegister" />
    </n-form-item>
    <n-form-item label="强制隐藏提交" prop="forceHideSubmissions">
      <n-switch v-model:value="siteSettingsForm.forceHideSubmissions" />
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
      </n-space>
    </n-form-item>
  </n-form>

  <n-divider />

  <h2>说明</h2>
  <p>以上信息将同步至服务器保存。</p>
  <p>
    每当用户访问网站时，都会自动从服务端拉取配置文件并保存至浏览器缓存中。其中大多数参数会即刻生效，但主题、MarkDown
    主题、句子API接口等仅与页面展示有关的配置项当且仅当用户主动在个人设置页更新时才会与本页面的配置同步，否则将继续使用浏览器缓存中的信息。
  </p>
</template>

<script setup>
import Axios from '@/plugins/axios';
import { ref, watch } from 'vue';

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
    message.success('保存成功');
  });
};

const reset = () => {
  Axios.delete('/site_settings/').then(() => {
    message.success('重置成功');
    init();
  });
};

const defaultSubmitLanguageOptions = ref([]);
watch(languages, () => {
  defaultSubmitLanguageOptions.value = languages.value.map(item => ({
    label: item.value,
    value: item.key,
  }));
});
const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
];
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
</script>
