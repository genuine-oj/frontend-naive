<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';

import MdEditor from '@/components/MdEditor.vue';
import router from '@/router';
import { useRoute } from 'vue-router';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const problem = ref({
  title: '',
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
});

if (id) {
  Axios.get(`/problem/${id}/`).then(res => {
    problem.value = res;
  });
}

const tagsOptions = ref([]);
Axios.get('/problem/tag/').then(res => {
  tagsOptions.value = res.map(tag => ({ label: tag.name, value: tag.id }));
});

const submiting = ref(false);
const notNull = [
  { key: 'title', name: '标题' },
  { key: 'description', name: '描述' },
  { key: 'tags', name: '标签' },
];
const submit = () => {
  for (const item of notNull) {
    if (!problem.value[item.key]) {
      message.warning(`题目${item.name}不能为空`);
      return;
    }
  }
  submiting.value = true;
  let req;
  if (id) req = Axios.put(`/problem/${id}/`, problem.value);
  else req = Axios.post('/problem/', problem.value);
  req
    .then(res => {
      router.push(`/problem/${res.id}/`);
    })
    .finally(() => {
      submiting.value = false;
    });
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
      <h2>运行限制</h2>
      <n-row>
        <n-col :span="6">
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
        <n-col :span="6">
          <h3>运行时间</h3>
          <n-input-number
            v-model:value="problem.time_limit"
            button-placement="both"
            style="text-align: center"
            :step="500"
            :min="1"
            :max="10000"
          >
            <template #suffix> MS </template>
          </n-input-number>
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
    提交
  </n-button>
</template>
