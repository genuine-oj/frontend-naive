<script setup>
import { ref } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import { useRoute } from 'vue-router';
import SubmissionTable from '@/components/SubmissionTable.vue';

const route = useRoute();
const id = route.params.id,
  data = ref({});

const loadData = () => {
  Axios.get(`/submission/${id}/`).then(res => {
    data.value = res;
  });
};

loadData();
</script>

<template>
  <n-layout>
    <h1>提交详情</h1>
    <n-layout-content>
      <n-layout-content v-if="data.id">
        <SubmissionTable :data="[data]" />
      </n-layout-content>
      <n-collapse
        style="margin-top: 20px"
        :default-expanded-names="['code', 'log', 'test_case']"
        display-directive="show"
      >
        <n-collapse-item title="源代码" name="code">
          <div style="overflow: auto">
            <n-code :code="data.source" language="cpp" show-line-numbers />
          </div>
        </n-collapse-item>
        <n-collapse-item title="运行日志" name="log" v-if="data.log">
          <div style="overflow: auto">
            <n-code :code="data.log" />
          </div>
        </n-collapse-item>
        <n-collapse-item title="测试点" name="test_case">
          <n-table :data="data.test_case" :bordered="false">
            <n-table-column title="测试点" key="test_case" />
            <n-table-column title="状态" key="status" />
            <n-table-column title="用时" key="execute_time" />
            <n-table-column title="内存" key="execute_memory" />
          </n-table>
        </n-collapse-item>
      </n-collapse>
    </n-layout-content>
  </n-layout>
</template>
