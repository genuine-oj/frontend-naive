<script setup>
import JSZip from 'jszip';
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import MdEditor from '@/components/MdEditor.vue';
import router from '@/router';
import { useRoute } from 'vue-router';
import { NButton, NDropdown, NInput, NInputNumber, NSpace } from 'naive-ui';
import ShowOrEdit from '@/components/ShowOrEdit';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const data = ref({
    test_case_config: [],
    subcheck_config: [],
    spj_source: null,
    delete_cases: [],
    use_subcheck: false,
  }),
  subcheck_cases = ref([]);
let newCases = [];

const init = () => {
  data.value = {
    test_case_config: [],
    subcheck_config: [],
    spj_source: null,
    delete_cases: [],
  };
  newCases = [];
  Axios.get(`/problem/data/${id}/`).then(res => {
    Object.assign(data.value, res);
    subcheck_cases.value = [];
    if (data.value.use_subcheck) {
      for (let i = 0; i < data.value.subcheck_config.length; i++)
        subcheck_cases.value.push([]);
      for (const item of data.value.test_case_config)
        subcheck_cases.value[item.subcheck].push(item.name);
    }
  });
};
init();

const handleCaseDelete = item => {
  if (newCases.filter(i => i.name === item.name).length) {
    // 从新建测试点中删除
    newCases = newCases.filter(i => i.name !== item.name);
  } else {
    // 添加到待删除列表
    data.value.delete_cases.push(item.name);
  }
  if (data.value.use_subcheck) {
    // 从所处的捆绑测试的测试点列表中删除
    subcheck_cases.value[item.subcheck] = subcheck_cases.value[
      item.subcheck
    ].filter(i => i !== item.name);
    if (!subcheck_cases.value[item.subcheck].length) {
      // 如果该捆绑测试点删除当前点后为空，则删除捆绑测试点
      delete subcheck_cases.value[item.subcheck];
      for (let i = item.subcheck + 1; i < subcheck_cases.value.length; i++) {
        subcheck_cases.value[i - 1] = subcheck_cases.value[i];
        for (const j of subcheck_cases.value[i - 1]) {
          data.value.test_case_config.find(i => i.name === j).subcheck = i - 1;
        }
      }
      subcheck_cases.value.pop();
    }
  }
  // 从测试点列表中删除
  data.value.test_case_config = data.value.test_case_config.filter(
    i => i.name !== item.name
  );
};

const fetching = ref(false),
  showModal = ref(false),
  modalData = ref({ file: '', content: '' });
const handleDownloadFile = file => {
  fetching.value = true;
  Axios.get(`/problem/data/${id}/file/${file}/`)
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
  Axios.get(`/problem/data/${id}/file/${file}/`, {
    params: {
      partly: true,
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
  if (length)
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
      subcheck: data.value.use_subcheck ? 0 : null,
    });
    if (data.value.use_subcheck) subcheck_cases.value[0].push(inputNames[i]);
    const input = await inputFiles[i].async('string'),
      ans = await outputFiles
        .find(v =>
          [`${inputNames[i]}.ans`, `${inputNames[i]}.out`].includes(v.name)
        )
        .async('string');
    newCases.push({
      name: inputNames[i],
      input,
      ans,
    });
  }
  if (data.value.use_subcheck) subcheck_cases.value[0].sort();
};

const clacSubcheckAverageScore = () => {
  const length = data.value.subcheck_config.length;
  for (let i = 0; i < length - 1; i++) {
    data.value.subcheck_config[i].score = parseInt(100 / length);
  }
  data.value.subcheck_config[length - 1].score =
    100 - parseInt(100 / length) * (length - 1);
};
const checkSubcheckSumScore = () => {
  let sum = 0;
  data.value.subcheck_config.forEach(item => {
    sum += item.score;
  });
  if (sum !== 100) {
    message.warning('总分不为100');
    return false;
  }
  return true;
};

const submiting = ref(false);
const submit = async () => {
  if (!(data.value.use_subcheck ? checkSubcheckSumScore() : checkSumScore()))
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
    if (['object', 'array'].includes(typeof value) && value !== null)
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
    data.value.subcheck_config = [{ score: 0 }];
    subcheck_cases.value = [[]];
    for (const i of data.value.test_case_config) {
      i.score = null;
      i.subcheck = 0;
      subcheck_cases.value[0].push(i.name);
    }
    subcheck_cases.value[0].sort();
    clacSubcheckAverageScore();
  } else {
    data.value.subcheck_config = [];
    subcheck_cases.value = [];
    for (const i of data.value.test_case_config) {
      i.subcheck = null;
    }
    clacAverageScore();
  }
};

const columns = [
  {
    title: '测试点名称',
    render(row) {
      return h(ShowOrEdit, {
        value: row.name,
        onUpdateValue(v) {
          for (const i of data.value.test_case_config) {
            if (i.name === v) {
              message.error('测试点名称不能重复');
              return;
            }
          }
          if (data.value.use_subcheck) {
            subcheck_cases.value[row.subcheck][
              subcheck_cases.value[row.subcheck].indexOf(row.name)
            ] = v;
            subcheck_cases.value[row.subcheck].sort();
          }
          for (const item of newCases) {
            if (item.name === row.name) {
              item.name = v;
              break;
            }
          }
          row.name = v;
        },
      });
    },
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
        value: row.subcheck,
        min: 0,
        max: 50,
        style: 'max-width: 150px; text-align: center',
        disabled: !data.value.use_subcheck,
        buttonPlacement: 'both',
        onUpdateValue: value => {
          const old = row.subcheck;
          subcheck_cases.value[old].splice(
            subcheck_cases.value[old].indexOf(row.name),
            1
          );
          if (subcheck_cases.value[old].length === 0) {
            subcheck_cases.value.splice(old, 1);
            data.value.subcheck_config.splice(old, 1);
            for (const i of data.value.test_case_config) {
              if (i.subcheck > old) i.subcheck--;
            }
          }
          if (value >= subcheck_cases.value.length) {
            value = subcheck_cases.value.length;
            subcheck_cases.value.push([row.name]);
            data.value.subcheck_config.push({ score: 0 });
          } else {
            subcheck_cases.value[value].push(row.name);
            subcheck_cases.value[value].sort();
          }
          row.subcheck = value;
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
      <n-checkbox
        v-model:checked="data.use_subcheck"
        @update:checked="useSubcheck"
      >
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
      <tr v-for="(item, index) in data.subcheck_config" :key="index">
        <td>{{ index }}</td>
        <td>
          <n-tooltip trigger="hover">
            <template #trigger>
              {{ subcheck_cases[index].length }}
            </template>
            {{ subcheck_cases[index].join(', ') }}
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
