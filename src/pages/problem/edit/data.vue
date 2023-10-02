<script setup>
import JSZip from 'jszip';
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import CodeWithCard from '@/components/CodeWithCard.vue';
import CodeMirror from '@/components/CodeMirror.vue';
import { useRoute } from 'vue-router';
import { NButton, NDropdown, NInputNumber, NSpace, NPopover } from 'naive-ui';
import ShowOrEdit from '@/components/ShowOrEdit';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const data = ref({
    test_case_config: [],
    subcheck_config: [],
    spj_source: '',
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
      delete data.value.subcheck_config[item.subcheck];
      for (
        let i = item.subcheck + 1;
        i < data.value.subcheck_config.length;
        i++
      ) {
        data.value.subcheck_config[i - 1] = data.value.subcheck_config[i];
      }
      data.value.subcheck_config.pop();
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
  let fileName = file.split('.');
  let type = fileName.pop();
  fileName = fileName.join('.');
  for (const item of newCases) {
    if (item.name === fileName) {
      message.error('新导入的未上传的测试点无法下载');
      return;
    }
  }
  const url = `/api/problem/data/${id}/file/${file}/`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', file);
  document.body.appendChild(link);
  link.click();
};
const handleShowFile = file => {
  let fileName = file.split('.');
  let type = fileName.pop();
  fileName = fileName.join('.');
  for (const item of newCases) {
    if (item.name === fileName) {
      modalData.value = { file, content: item[type] };
      showModal.value = true;
      return;
    }
  }
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
const fileCmp = (a, b) => a.name < b.name;
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
  if (data.value.use_subcheck && !data.value.subcheck_config.length) {
    data.value.subcheck_config = [{ score: 0 }];
    subcheck_cases.value = [[]];
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
      in: input,
      ans,
    });
  }
  if (data.value.use_subcheck) subcheck_cases.value[0].sort();
  setTimeout(() => {
    loadingZip.value = false;
  }, 200);
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
      zip.file(`${item.name}.in`, item.in);
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
    .catch(() => {
      message.error('保存失败');
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
  data.value.use_spj = false;
};

const handleCaseSort = key => {
  try {
    if (key === 'name') {
      data.value.test_case_config.sort((a, b) => a.name.localeCompare(b.name));
    } else if (key === 'firstNumber') {
      data.value.test_case_config.sort((a, b) => {
        const aNumber = parseInt(a.name.match(/\d+/)[0]),
          bNumber = parseInt(b.name.match(/\d+/)[0]);
        return aNumber - bNumber;
      });
    } else if (key === 'allNumber') {
      data.value.test_case_config.sort((a, b) => {
        const aNumber = parseInt(a.name.match(/\d+/g).join('')),
          bNumber = parseInt(b.name.match(/\d+/g).join(''));
        return aNumber - bNumber;
      });
    } else if (key === 'allLetter_allNumber') {
      data.value.test_case_config.sort((a, b) => {
        const aNumber = a.name.match(/\d+/g),
          bNumber = b.name.match(/\d+/g),
          aLetter = a.name.match(/[a-zA-Z]+/g),
          bLetter = b.name.match(/[a-zA-Z]+/g);
        if (aLetter === null && bLetter === null) {
          return parseInt(aNumber.join('')) - parseInt(bNumber.join(''));
        } else if (aLetter === null) {
          return 1;
        } else if (bLetter === null) {
          return -1;
        } else {
          const aLetterNumber = aLetter
            .join('')
            .localeCompare(bLetter.join(''));
          if (aLetterNumber === 0) {
            return parseInt(aNumber.join('')) - parseInt(bNumber.join(''));
          } else {
            return aLetterNumber;
          }
        }
      });
    }
  } catch (e) {
    message.error('测试点名称不符合所选排序方式要求的规范');
  }
};

const autoSubcheckCnt = ref(1);
const autoSubcheck = () => {
  data.value.subcheck_config = [];
  subcheck_cases.value = [];
  const length = data.value.test_case_config.length;
  for (let i = 0, j = 0; i < length; i += autoSubcheckCnt.value, j++) {
    data.value.subcheck_config.push({ score: 0 });
    subcheck_cases.value.push([]);
    for (let k = i; k < i + autoSubcheckCnt.value && k < length; k++) {
      data.value.test_case_config[k].subcheck = j;
      subcheck_cases.value[j].push(data.value.test_case_config[k].name);
    }
  }
  clacSubcheckAverageScore();
  message.success('捆绑测试自动编排成功');
};
const columns = [
  {
    title() {
      return h(
        NSpace,
        {},
        {
          default: () => [
            '测试点名称',
            h(
              NDropdown,
              {
                trigger: 'hover',
                options: [
                  {
                    label: '字典序',
                    key: 'name',
                  },
                  {
                    label: '第一处连续数字',
                    key: 'firstNumber',
                  },
                  {
                    label: '连接所有数字',
                    key: 'allNumber',
                  },
                  {
                    label: '连接所有字母 + 连接所有数字',
                    key: 'allLetter_allNumber',
                  },
                ],
                onSelect: handleCaseSort,
              },
              {
                default: () =>
                  h(NButton, { size: 'small' }, { default: () => '排序' }),
              }
            ),
          ],
        }
      );
    },
    render(row) {
      return h(ShowOrEdit, {
        value: row.name,
        onUpdateValue(v) {
          if (v === row.name) {
            return;
          } else if (!v) {
            message.error('测试点名称不能为空');
            return;
          } else if (data.value.test_case_config.some(i => i.name === v)) {
            message.error('测试点名称不能重复');
            return;
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
    title() {
      return h(
        NSpace,
        {},
        {
          default: () => [
            '捆绑测试',
            h(
              NPopover,
              {
                trigger: 'hover',
              },
              {
                default: () => [
                  h(NInputNumber, {
                    value: autoSubcheckCnt.value,
                    min: 1,
                    max: data.value.test_case_config.length,
                    style: 'width: 120px; text-align: center',
                    buttonPlacement: 'both',
                    disabled: !data.value.use_subcheck,
                    onUpdateValue: value => {
                      autoSubcheckCnt.value = value;
                    },
                  }),
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'primary',
                      style: {
                        marginTop: '10px',
                        width: '120px',
                      },
                      onClick: autoSubcheck,
                      disabled: !data.value.use_subcheck,
                    },
                    {
                      default: () => `每 ${autoSubcheckCnt.value} 个点一组`,
                    }
                  ),
                ],
                trigger: () =>
                  h(
                    NButton,
                    { size: 'small', disabled: !data.value.use_subcheck },
                    { default: () => '自动编排' }
                  ),
              }
            ),
          ],
        }
      );
    },
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
        :disabled="data.use_spj"
      >
        捆绑测试
      </n-checkbox>
      <n-checkbox v-model:checked="data.use_spj" :disabled="data.use_subcheck">
        Special Judge
      </n-checkbox>
      <n-checkbox
        v-model:checked="data.allow_download"
        @update:checked="() => (data.use_subcheck = false)"
      >
        允许下载测试点
      </n-checkbox>
    </n-space>
    <n-data-table
      :bordered="false"
      :single-line="false"
      :columns="columns"
      :data="data.test_case_config"
      :loading="loadingZip"
    />
  </n-space>

  <n-divider v-if="data.use_subcheck || data.use_spj" />

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
          <n-tooltip trigger="hover" v-if="subcheck_cases[index]">
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

  <CodeMirror
    v-if="data.use_spj"
    v-model:code="data.spj_source"
    language="cpp"
    placeholder="请粘贴 SPJ Checker 代码..."
  />

  <n-divider />

  <n-upload
    :default-upload="false"
    @change="loadZip"
    abstract
    accept="application/zip"
    ref="uploadElement"
  >
    <n-space style="height: 45px; align-items: center">
      <n-upload-trigger #="{ handleClick }" abstract>
        <n-button
          @click="handleClick"
          :disbled="loadingZip"
          :loading="loadingZip"
        >
          选择 ZIP 文件
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
      <CodeWithCard :code="modalData.content" />
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
