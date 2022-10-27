<script setup>
import { ref } from 'vue';
import { Axios } from '@/plugins/axios';
import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';
import { formatTime, formatSize } from '@/plugins/utils';
import { judgeStatus } from '@/plugins/consts';
import SubmissionTable from '@/components/SubmissionTable.vue';
// import CodeWithCard from '@/components/CodeWithCard.vue';

const route = useRoute();

const id = route.params.id,
  data = ref({}),
  detail_data = ref({});

const loadData = () => {
  Axios.get(`/submission/${id}/`).then(res => {
    data.value = res;
    if (res.status <= -3) {
      setTimeout(loadData, 1000);
    }
  });
};

loadData();

const loadDetail = ({ name, expanded }) => {
  if (!detail_data.value[name]) {
    detail_data.value[name] = {};
    Axios.get(`/submission/${id}/test-point/${name}/`).then(res => {
      detail_data.value[name] = res;
    });
  }
};
</script>

<template>
  <h1>提交详情</h1>
  <n-layout-content v-if="data.id">
    <SubmissionTable :data="[data]" />
  </n-layout-content>
  <n-collapse
    style="margin-top: 20px; height: 100%"
    :default-expanded-names="['code', 'log']"
    display-directive="show"
  >
    <n-collapse-item title="源代码" name="code">
      <n-card>
        <n-scrollbar x-scrollable style="margin-bottom: -10px">
          <div style="padding-bottom: 15px">
            <n-code
              v-if="data.language"
              :code="data.source"
              :language="data.language"
              show-line-numbers
            />
          </div>
        </n-scrollbar>
      </n-card>
    </n-collapse-item>
    <n-collapse-item title="运行日志" name="log" v-if="data.log">
      <n-card>
        <n-scrollbar x-scrollable style="margin-bottom: -10px">
          <div style="padding-bottom: 15px">
            <n-code :code="data.log" />
          </div>
        </n-scrollbar>
      </n-card>
    </n-collapse-item>
    <n-collapse-item
      title="测试点"
      name="test_point"
      v-if="data.detail && data.detail.length"
    >
      <n-collapse @item-header-click="loadDetail">
        <n-collapse-item
          v-for="(item, index) in data.detail"
          :key="index"
          :title="`测试点 #${index + 1}`"
          :name="index + 1"
        >
          <template #header-extra>
            <n-space>
              <n-tag
                style="padding: 0 10px"
                :color="{
                  color: judgeStatus.getColorClass(item.status),
                  borderColor: judgeStatus.getColorClass(item.status),
                  textColor: store.state.theme === 'dark' ? '#000' : '#FFF',
                }"
              >
                {{ judgeStatus.getDisplay(item.status) }}
              </n-tag>
              <span>
                {{ formatTime(item.statistics.time) }}
              </span>
              <span>
                {{ formatSize(item.statistics.memory) }}
              </span>
            </n-space>
          </template>
          <n-collapse :default-expanded-names="['in', 'out', 'ans']">
            <n-collapse-item title="输入" name="in">
              <n-card>
                <n-scrollbar x-scrollable style="margin-bottom: -10px">
                  <div style="padding-bottom: 15px">
                    <n-code :code="detail_data[item.case_name].in" />
                  </div>
                </n-scrollbar>
              </n-card>
            </n-collapse-item>
            <n-collapse-item
              title="输出"
              name="out"
              v-if="data.status !== judgeStatus.ACCEPTED"
            >
              <n-card>
                <n-scrollbar x-scrollable style="margin-bottom: -10px">
                  <div style="padding-bottom: 15px">
                    <n-code :code="detail_data[item.case_name].out" />
                  </div>
                </n-scrollbar>
              </n-card>
            </n-collapse-item>
            <n-collapse-item
              :title="
                data.status === judgeStatus.ACCEPTED
                  ? '输出 / 预期输出'
                  : ' 预期输出'
              "
              name="ans"
            >
              <n-card>
                <n-scrollbar x-scrollable style="margin-bottom: -10px">
                  <div style="padding-bottom: 15px">
                    <n-code :code="detail_data[item.case_name].ans" />
                  </div>
                </n-scrollbar>
              </n-card>
            </n-collapse-item>
          </n-collapse>
        </n-collapse-item>
      </n-collapse>
    </n-collapse-item>
  </n-collapse>
</template>
