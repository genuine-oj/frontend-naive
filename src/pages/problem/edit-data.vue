<script setup>
import JSZip from 'jszip';
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import MdEditor from '@/components/MdEditor.vue';
import router from '@/router';
import { useRoute } from 'vue-router';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const data = ref({
  test_case_config: [],
  test_cases: null,
  spj_source: '',
  delete_cases: [],
});

Axios.get(`/problem/data/${id}/`).then(res => {
  Object.assign(data.value, res);
});

const handleCaseDelete = item => {
  data.value.delete_cases.push(item.name);
  data.value.test_case_config = data.value.test_case_config.filter(
    i => i.name !== item.name
  );
};

const fetching = ref(false),
  showModal = ref(false),
  modalData = ref({ file: '', content: '' });
const handleDownloadFile = file => {
  fetching.value = true;
  Axios.get(`/problem/data/${id}/`, {
    params: {
      mode: 'fetch',
      file,
    },
  })
    .then(res => {
      const blob = new Blob([res], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file;
      link.click();
      link.remove();
    })
    .finally(() => {
      fetching.value = false;
    });
};
const handleShowFile = file => {
  fetching.value = true;
  Axios.get(`/problem/data/${id}/`, {
    params: {
      mode: 'fetch',
      partly: true,
      file,
    },
  })
    .then(res => {
      modalData.value = { file, content: res };
      showModal.value = true;
    })
    .finally(() => {
      fetching.value = false;
    });
};

const clacAverageScore = () => {
  const length = data.value.test_case_config.length;
  for (let i = 0; i < length - 1; i++) {
    data.value.test_case_config[i].score = parseInt(100 / length);
  }
  data.value.test_case_config[length - 1].score =
    100 - parseInt(100 / length) * (length - 1);
};
const checkSumScore = () => {
  let sum = 0;
  data.value.test_case_config.forEach(item => {
    sum += item.score;
  });
  if (sum !== 100) {
    message.warning('总分不为100');
    return false;
  }
  return true;
};

const submiting = ref(false);
const submit = () => {
  if (!checkSumScore()) return;
  submiting.value = true;
  Axios.put(`/problem/data/${id}/`, data.value)
    .then(() => {
      message.success('保存成功');
    })
    .finally(() => {
      submiting.value = false;
    });
};
</script>

<template>
  <h1>编辑题目数据</h1>
  <n-divider />
  <n-table :bordered="false" :single-line="false">
    <thead>
      <tr>
        <th>编号</th>
        <th>
          <n-space>
            分值
            <n-button size="small" @click="clacAverageScore">
              计算平均
            </n-button>
          </n-space>
        </th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data.test_case_config" :key="item.name">
        <td>{{ item.name }}</td>
        <td>
          <n-input-number
            v-model:value="item.score"
            :min="0"
            :max="100"
            style="max-width: 150px; text-align: center"
            button-placement="both"
            @blur="checkSumScore"
          />
        </td>
        <td>
          <n-space>
            <n-dropdown
              trigger="hover"
              :options="[
                { label: '输入文件', key: `${item.name}.in` },
                { label: '答案文件', key: `${item.name}.ans` },
              ]"
              @select="handleShowFile"
            >
              <n-button :loading="fetching" :disabled="fetching">
                查看
              </n-button>
            </n-dropdown>
            <n-dropdown
              trigger="hover"
              :options="[
                { label: '输入文件', key: `${item.name}.in` },
                { label: '答案文件', key: `${item.name}.ans` },
              ]"
              @select="handleDownloadFile"
            >
              <n-button :loading="fetching" :disabled="fetching">
                下载
              </n-button>
            </n-dropdown>
            <n-button
              @click="handleCaseDelete(item)"
              :disabled="data.test_case_config.length <= 1"
            >
              删除
            </n-button>
          </n-space>
        </td>
      </tr>
    </tbody>
  </n-table>
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

  <n-modal v-model:show="showModal">
    <n-card
      style="padding: 15px; width: max(45%, 600px)"
      :title="modalData.file"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-card class="sample-card">
        <n-scrollbar x-scrollable>
          <div class="sample">
            <n-code :code="modalData.content" />
          </div>
        </n-scrollbar>
      </n-card>
    </n-card>
  </n-modal>
</template>

<style lang="scss">
.sample-card {
  .n-card__content {
    padding: 0 !important;
    margin: 0;
  }
  .sample {
    padding: 20px;
  }
}
</style>
