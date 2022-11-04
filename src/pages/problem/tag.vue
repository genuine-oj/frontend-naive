<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import { NInput, NButton } from 'naive-ui';

const message = useMessage();

const data = ref([]),
  _delete = ref([]),
  create = ref([]),
  update = ref([]),
  loading = ref(false);

const saveData = res => {
  data.value = res;
  _delete.value = [];
  create.value = [];
  update.value = [];
  loading.value = false;
};

const loadData = () => {
  loading.value = true;
  Axios.get('/problem/tag/').then(saveData);
};
loadData();

const columns = [
  {
    title: 'ID',
    key: 'id',
  },
  {
    title: '名称',
    key: 'name',
    render(row, index) {
      return h(NInput, {
        value: row.name,
        onUpdateValue(v) {
          if (index < data.value.length) {
            data.value[index].name = v;
            update.value = update.value.filter(x => x.id !== row.id);
            update.value.push(row);
          } else {
            create.value[index - data.value.length].name = v;
          }
        },
      });
    },
  },
  {
    title: '操作',
    render(row) {
      return h(
        NButton,
        {
          onClick: () => {
            _delete.value.push(row.id);
            data.value = data.value.filter(x => x.id !== row.id);
          },
        },
        { default: () => '删除' }
      );
    },
  },
];

const addTag = () => {
  create.value.push({ id: '-', name: '' });
};

const submit = () => {
  loading.value = true;
  Axios.post('/problem/tag/', {
    create: create.value.map(x => x.name),
    update: update.value,
    delete: _delete.value,
  }).then(res => {
    message.success('保存成功');
    saveData(res);
  });
};
</script>

<template>
  <h1>标签管理</h1>

  <n-divider />

  <n-space vertical size="large">
    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="data.concat(create)"
        :bordered="false"
      />
    </n-spin>
    <n-button @click="addTag">新增</n-button>
  </n-space>

  <n-divider />

  <p style="font-size: medium">
    保存前请<b>务必确认确认操作无误</b>！误操作只能通过数据库备份文件恢复，将造成不可估量的数据丢失！
  </p>
  <n-space style="margin-top: 20px">
    <n-popconfirm @positive-click="submit">
      <template #trigger>
        <n-button type="warning" :loading="loading" :disabled="loading">
          保存
        </n-button>
      </template>
      请再次确认操作无误！
    </n-popconfirm>

    <n-button @click="loadData" :loading="loading" :disabled="loading">
      重置
    </n-button>
  </n-space>
</template>
