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
  spj_source: null,
  delete_cases: [],
});
let newCases = [];

const init = () => {
  data.value = {
    test_case_config: [],
    spj_source: null,
    delete_cases: [],
  };
  newCases = [];
  Axios.get(`/problem/data/${id}/`).then(res => {
    Object.assign(data.value, res);
  });
};
init();

const handleCaseDelete = item => {
  if (newCases.filter(i => i.name === item.name).length) {
    newCases = newCases.filter(i => i.name !== item.name);
  } else {
    data.value.delete_cases.push(item.name);
  }
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

const uploadElement = ref(null),
  loadingZip = ref(false);
const fileCmp = (a, b) => a.name - b.name;
const loadZip = async event => {
  loadingZip.value = true;
  const file = event.file.file;
  setTimeout(() => {
    uploadElement.value.clear();
  });
  const zip = await new JSZip().loadAsync(file);
  const inputFiles = zip.file(/^[^/]+\.in$/i).sort(fileCmp),
    outputFiles = zip.file(/^[^/]+\.(out|ans)$/i).sort(fileCmp);
  const inputNames = inputFiles.map(
      v => v.name.match(/^(?<n>[^/]+)\.in$/i).groups.n
    ),
    outputNames = outputFiles.map(
      v => v.name.match(/^(?<n>[^/]+)\.(out|ans)$/i).groups.n
    ),
    currentNames = data.value.test_case_config.map(v => v.name);
  setTimeout(() => {
    loadingZip.value = false;
  }, 200);
  for (const v of inputNames) {
    if (currentNames.includes(v)) {
      message.error(`测试点'${v}'已存在`);
      return;
    } else if (!outputNames.includes(v)) {
      message.error(`测试点'${v}'缺少输出文件`);
      return;
    }
  }
  for (const v of outputNames) {
    if (!inputNames.includes(v)) {
      message.error(`测试点'${v}'缺少输入文件`);
      return;
    }
  }
  for (let i = 0; i < inputFiles.length; i++) {
    data.value.test_case_config.push({
      name: inputNames[i],
      score: 0,
    });
    const input = await inputFiles[i].async('string'),
      ans = await outputFiles[i].async('string');
    newCases.push({
      name: inputNames[i],
      input,
      ans,
    });
  }
};

const submiting = ref(false);
const submit = async () => {
  if (!checkSumScore()) return;
  submiting.value = true;
  const formData = new FormData();
  if (newCases.length) {
    const zip = new JSZip();
    newCases.forEach(item => {
      zip.file(`${item.name}.in`, item.input);
      zip.file(`${item.name}.ans`, item.ans);
    });
    formData.append('test_cases', await zip.generateAsync({ type: 'blob' }));
  }
  Object.keys(data.value).forEach(key => {
    const value = data.value[key];
    if (typeof value === 'object' && value !== null)
      formData.append(key, JSON.stringify(value));
    else formData.append(key, value);
  });
  Axios.put(`/problem/data/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(() => {
      message.success('保存成功');
    })
    .finally(() => {
      submiting.value = false;
    });
};
</script>

<template>
  <n-table :bordered="false" :single-line="false">
    <thead>
      <tr>
        <th>名称</th>
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

  <n-upload
    :default-upload="false"
    @change="loadZip"
    abstract
    accept="application/zip"
    :max="1"
    ref="uploadElement"
  >
    <n-space style="height: 45px; align-items: center">
      <n-upload-trigger #="{ handleClick }" abstract>
        <n-button
          @click="handleClick"
          :disbled="loadingZip"
          :loading="loadingZip"
        >
          选择文件
        </n-button>
      </n-upload-trigger>
      <n-upload-file-list />
    </n-space>
  </n-upload>

  <n-divider />

  <n-space>
    <n-button
      type="primary"
      size="large"
      @click="submit"
      :loading="submiting"
      :disabled="submiting"
    >
      保存
    </n-button>
    <n-button size="large" @click="init"> 重置 </n-button>
  </n-space>

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
