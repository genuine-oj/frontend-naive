<script setup>
import JSZip from 'jszip';
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import MdEditor from '@/components/MdEditor.vue';
import router from '@/router';
import { useRoute } from 'vue-router';
import { NButton, NDropdown, NInputNumber, NSpace } from 'naive-ui';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const data = ref({
  test_case_config: [],
  subcheck_config: [],
  spj_source: null,
  delete_cases: [],
  use_subcheck: false,
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

const clacSubcheckAverageScore = () => {
  const keys = Object.keys(data.value.subcheck_config);
  console.log(keys);
  const length = keys.length;
  for (let i = 0; i < length - 1; i++) {
    data.value.subcheck_config[keys[i]].score = parseInt(100 / length);
  }
  data.value.subcheck_config[keys[length - 1]].score =
    100 - parseInt(100 / length) * (length - 1);
};
const checkSubcheckSumScore = () => {
  let sum = 0;
  const keys = Object.keys(data.value.subcheck_config);
  keys.forEach(key => {
    sum += data.value.subcheck_config[key].score;
  });
  if (sum !== 100) {
    message.warning('总分不为100');
    return false;
  }
  return true;
};

const submiting = ref(false);
const submit = async () => {
  if ((data.value.use_subcheck && !checkSubcheckSumScore()) || !checkSumScore())
    return;
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

const useSubcheck = value => {
  if (value) {
    data.value.subcheck_config = { 0: { score: 0, name: '0', cases: [] } };
    for (const i of data.value.test_case_config) {
      i.score = 0;
      i.subcheck = 0;
      data.value.subcheck_config[0].cases.push(i.name);
    }
    data.value.subcheck_config[0].cases.sort();
    clacSubcheckAverageScore();
  } else {
    data.value.subcheck_config = {};
    for (const i of data.value.test_case_config) {
      i.subcheck = '';
    }
    clacAverageScore();
  }
};

const columns = [
  {
    title: '测试点名称',
    key: 'name',
  },
  {
    title() {
      return h(
        NSpace,
        {},
        {
          default: () => [
            '分值',
            h(
              NButton,
              {
                size: 'small',
                onClick: clacAverageScore,
                disabled: data.value.use_subcheck,
              },
              { default: () => '计算平均' }
            ),
          ],
        }
      );
    },
    render(row) {
      return h(NInputNumber, {
        value: row.score,
        min: 0,
        max: 100,
        style: 'max-width: 150px; text-align: center',
        buttonPlacement: 'both',
        onUpdateValue: value => {
          row.score = value;
        },
        disabled: data.value.use_subcheck,
      });
    },
  },
  {
    title: '捆绑测试',
    render(row) {
      return h(NInputNumber, {
        value: (row.subcheck = row.subcheck ?? 0),
        min: 0,
        max: 50,
        style: 'max-width: 150px; text-align: center',
        disabled: !data.value.use_subcheck,
        buttonPlacement: 'both',
        onUpdateValue: value => {
          const toDelete = [];
          for (const i in data.value.subcheck_config) {
            if (data.value.subcheck_config[i].cases.includes(row.name)) {
              data.value.subcheck_config[i].cases.splice(
                data.value.subcheck_config[i].cases.indexOf(row.name),
                1
              );
            }
            if (data.value.subcheck_config[i].cases.length === 0) {
              toDelete.push(i);
            }
          }
          for (let i = 0; i < value; i++) {
            if (
              !data.value.subcheck_config[i] ||
              toDelete.includes(String(i))
            ) {
              value = i;
              break;
            }
          }
          for (const i of toDelete) {
            if (i !== String(value)) delete data.value.subcheck_config[i];
          }
          row.subcheck = value;
          if (data.value.subcheck_config[row.subcheck] === undefined) {
            data.value.subcheck_config[row.subcheck] = {
              name: row.subcheck,
              cases: [],
              score: 0,
            };
          }
          data.value.subcheck_config[row.subcheck].cases.push(row.name);
          data.value.subcheck_config[row.subcheck].cases.sort();
        },
      });
    },
  },
  {
    title: '操作',
    render(row) {
      return h(
        NSpace,
        {},
        {
          default: () => [
            h(
              NDropdown,
              {
                trigger: 'hover',
                options: [
                  { label: '输入文件', key: `${row.name}.in` },
                  { label: '答案文件', key: `${row.name}.ans` },
                ],
                onSelect: handleShowFile,
              },
              {
                default: () =>
                  h(
                    NButton,
                    { loading: fetching.value },
                    { default: () => '查看' }
                  ),
              }
            ),
            h(
              NDropdown,
              {
                trigger: 'hover',
                options: [
                  { label: '输入文件', key: `${row.name}.in` },
                  { label: '答案文件', key: `${row.name}.ans` },
                ],
                onSelect: handleDownloadFile,
              },
              {
                default: () =>
                  h(
                    NButton,
                    { loading: fetching.value },
                    { default: () => '下载' }
                  ),
              }
            ),
            h(
              NButton,
              {
                onClick: () => handleCaseDelete(row),
                disabled: data.value.test_case_config.length <= 1,
              },
              { default: () => '删除' }
            ),
          ],
        }
      );
    },
  },
];
</script>

<template>
  <n-space vertical size="large">
    <n-space>
      <n-checkbox v-model:checked="data.use_subcheck" @change="useSubcheck">
        捆绑测试
      </n-checkbox>
    </n-space>
    <n-data-table
      :bordered="false"
      :single-line="false"
      :columns="columns"
      :data="data.test_case_config"
    />
  </n-space>

  <n-divider v-if="data.use_subcheck" />

  <n-table v-if="data.use_subcheck" :bordered="false" :single-line="false">
    <thead>
      <tr>
        <th>捆绑测试</th>
        <th>测试点数量</th>
        <th>
          <n-space>
            分值
            <n-button size="small" @click="clacSubcheckAverageScore">
              计算平均
            </n-button>
          </n-space>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data.subcheck_config" :key="item.name">
        <td>{{ item.name }}</td>
        <td>
          <n-tooltip trigger="hover">
            <template #trigger>
              {{ item.cases.length }}
            </template>
            {{ item.cases.join(', ') }}
          </n-tooltip>
        </td>
        <td>
          <n-input-number
            v-model:value="item.score"
            :min="0"
            :max="100"
            style="max-width: 150px; text-align: center"
            button-placement="both"
          />
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
