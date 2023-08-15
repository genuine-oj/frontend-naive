<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import { difficultyOptions } from '@/plugins/consts';
import MdEditor from '@/components/MdEditor.vue';
import router from '@/router';
import { useRoute } from 'vue-router';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const problem = ref({
  title: '',
  background: '',
  description: '',
  input_format: '',
  output_format: '',
  samples: [
    { input: '', output: '' },
    { input: '', output: '' },
    { input: '', output: '' },
  ],
  tags: [],
  hint: '',
  memory_limit: 128,
  time_limit: 1000,
  is_hidden: false,
  hide_submissions: false,
  _allow_submit: true,
});
const fileList = ref([]);

if (id) {
  Axios.get(`/problem/${id}/`).then(res => {
    res.tags = res.tags.map(tag => tag.id);
    problem.value = res;
    fileList.value = res.files.map(file => ({
      name: file,
      status: 'finished',
    }));
  });
}

const tagsOptions = ref([]);
Axios.get('/problem/tag/').then(res => {
  tagsOptions.value = res.map(tag => ({ label: tag.name, value: tag.id }));
});

const submiting = ref(false);
const submit = () => {
  if (!problem.value['title']) {
    message.warning(`题目标题不能为空`);
    return;
  }
  submiting.value = true;
  const files = fileList.value
    .filter(file => file.status === 'finished')
    .map(file => file.name);
  let req;
  if (id) req = Axios.put(`/problem/${id}/`, { ...problem.value, files });
  else req = Axios.post('/problem/', { ...problem.value, files });
  req
    .then(res => {
      if (!id) router.push({ name: 'problem_detail', params: { id: res.id } });
      else message.success('修改成功');
    })
    .finally(() => {
      submiting.value = false;
    });
};

const removeFile = ({ file }) => {
  if (file.status === 'error') return true;
  return Axios.delete(`/problem/${id}/file/${file.name}/`);
};
</script>

<template>
  <n-space vertical size="large">
    <div>
      <h2>题目标题</h2>
      <n-input
        v-model:value="problem.title"
        placeholder="请输入标题"
        size="large"
      />
    </div>
    <div>
      <h2>题目背景</h2>
      <MdEditor v-model:content="problem.background" />
    </div>
    <div>
      <h2>题目描述</h2>
      <MdEditor v-model:content="problem.description" />
    </div>
    <div>
      <h2>题目输入</h2>
      <MdEditor v-model:content="problem.input_format" />
    </div>
    <div>
      <h2>题目输出</h2>
      <MdEditor v-model:content="problem.output_format" />
    </div>
    <div>
      <h2>标签</h2>
      <n-select
        v-model:value="problem.tags"
        multiple
        filterable
        placeholder="请选择标签"
        :options="tagsOptions"
      />
    </div>
    <div>
      <h2>样例</h2>
      <n-tabs type="line" animated>
        <n-tab-pane
          v-for="(item, index) in problem.samples"
          :key="index"
          :name="'sample_' + String(index + 1)"
          :tab="'样例 #' + String(index + 1)"
          display-directive="show:lazy"
        >
          <n-row>
            <n-col :span="11">
              <h3>样例输入 #{{ index + 1 }}</h3>
              <n-input v-model:value="item.input" type="textarea" :rows="10" />
            </n-col>
            <n-col :span="2"></n-col>
            <n-col :span="11">
              <h3>样例输出 #{{ index + 1 }}</h3>
              <n-input v-model:value="item.output" type="textarea" :rows="10" />
            </n-col>
          </n-row>
        </n-tab-pane>
      </n-tabs>
    </div>
    <div>
      <h2>提示</h2>
      <MdEditor v-model:content="problem.hint" />
    </div>
    <div>
      <h2>附件</h2>
      <n-upload
        v-if="id"
        :action="`/api/problem/${id}/file/`"
        @remove="removeFile"
        v-model:file-list="fileList"
      >
        <n-button>上传文件</n-button>
      </n-upload>
      <p v-else style="font-size: medium">题目创建后才可上传。</p>
    </div>
    <div>
      <h2>运行限制</h2>
      <n-row style="padding: 0 1px">
        <n-col :span="4">
          <h3>运行内存</h3>
          <n-input-number
            v-model:value="problem.memory_limit"
            button-placement="both"
            style="text-align: center"
            :min="1"
            :max="2048"
          >
            <template #suffix> MB </template>
          </n-input-number>
        </n-col>
        <n-col :span="1"></n-col>
        <n-col :span="4">
          <h3>运行时间</h3>
          <n-input-number
            v-model:value="problem.time_limit"
            button-placement="both"
            style="text-align: center"
            :step="500"
            :min="1"
            :max="10000"
          >
            <template #suffix> ms </template>
          </n-input-number>
        </n-col>
      </n-row>
    </div>
    <div>
      <h2>其它设置</h2>
      <n-row style="padding: 0 1px">
        <n-col :span="4">
          <h3>难度设置</h3>
          <n-select
            v-model:value="problem.difficulty"
            :options="difficultyOptions"
            placeholder="请选择难度"
          />
        </n-col>
        <n-col :span="1"></n-col>
        <n-col :span="4">
          <h3>是否隐藏</h3>
          <n-switch v-model:value="problem.is_hidden" />
        </n-col>
        <n-col :span="1"></n-col>
        <n-col :span="4">
          <h3>是否允许提交</h3>
          <n-switch v-model:value="problem._allow_submit" />
        </n-col>
        <n-col :span="1"></n-col>
        <n-col :span="4">
          <h3>是否隐藏提交</h3>
          <n-switch v-model:value="problem.hide_submissions" />
        </n-col>
      </n-row>
    </div>
  </n-space>
  <n-divider />
  <n-button
    type="primary"
    size="large"
    @click="submit"
    :loading="submiting"
    :disabled="submiting"
  >
    保存
  </n-button>
</template>
