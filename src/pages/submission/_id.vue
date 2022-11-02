<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';
import { formatTime, formatSize } from '@/plugins/utils';
import { judgeStatus, noTime, noMemory } from '@/plugins/consts';
import SubmissionTable from '@/components/SubmissionTable.vue';

const route = useRoute();

const id = route.params.id,
  data = ref({}),
  detailData = ref({}),
  useSubcheck = ref(false),
  subchecks = ref([]),
  showingSubchecks = ref([]);

const loadData = () => {
  Axios.get(`/submission/${id}/`).then(res => {
    subchecks.value = [];
    for (const i of res.detail) {
      if (i.subcheck !== null) {
        useSubcheck.value = true;
      }
      if (useSubcheck.value && !subchecks.value.includes(i.subcheck)) {
        subchecks.value.push(i.subcheck);
      }
    }
    if (useSubcheck.value) {
      subchecks.value.sort((a, b) => a < b);
      showingSubchecks.value = subchecks.value;
      res.detail.sort((a, b) => {
        if (a.subcheck !== b.subcheck)
          return Number(a.subcheck) < Number(b.subcheck);
        return a.case_name < b.case_name;
      });
    }
    data.value = res;
    if (res.status <= -3) {
      setTimeout(loadData, 1000);
    }
  });
};

loadData();

const loadDetail = ({ name, expanded }) => {
  if (!detailData.value[name]) {
    detailData.value[name] = {};
    Axios.get(`/submission/${id}/test-point/${name}/`).then(res => {
      detailData.value[name] = res;
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
    <n-collapse-item title="日志" name="log" v-if="data.log">
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
      <n-checkbox-group v-model:value="showingSubchecks" v-if="useSubcheck">
        <n-space
          item-style="display: flex"
          style="margin-left: 32px; margin-bottom: 20px"
        >
          显示捆绑测试：
          <n-checkbox
            v-for="item in subchecks"
            :key="item"
            :value="item"
            :label="item"
          />
        </n-space>
      </n-checkbox-group>
      <n-collapse @item-header-click="loadDetail">
        <n-collapse-item
          :name="item.case_name"
          v-for="(item, index) in data.detail"
          :key="index"
          v-show="!useSubcheck || showingSubchecks.includes(item.subcheck)"
        >
          <template #header>
            <n-space>
              测试点 {{ item.case_name }}
              <n-tag v-if="useSubcheck" size="small" type="info">
                捆绑测试 {{ item.subcheck }}
              </n-tag>
            </n-space>
          </template>
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
              <span v-if="!noTime.includes(item.status)">
                {{ formatTime(item.statistics.time) }}
              </span>
              <span v-if="!noMemory.includes(item.status)">
                {{ formatSize(item.statistics.memory) }}
              </span>
            </n-space>
          </template>
          <n-collapse :default-expanded-names="['in', 'out', 'ans']">
            <n-collapse-item title="输入" name="in">
              <n-card>
                <n-scrollbar x-scrollable style="margin-bottom: -10px">
                  <div style="padding-bottom: 15px">
                    <n-code :code="detailData[item.case_name].in" />
                  </div>
                </n-scrollbar>
              </n-card>
            </n-collapse-item>
            <n-collapse-item
              title="输出"
              name="out"
              v-if="item.status !== judgeStatus.ACCEPTED"
            >
              <n-card>
                <n-scrollbar x-scrollable style="margin-bottom: -10px">
                  <div style="padding-bottom: 15px">
                    <n-code :code="detailData[item.case_name].out" />
                  </div>
                </n-scrollbar>
              </n-card>
            </n-collapse-item>
            <n-collapse-item
              :title="
                item.status === judgeStatus.ACCEPTED
                  ? '输出 / 预期输出'
                  : ' 预期输出'
              "
              name="ans"
            >
              <n-card>
                <n-scrollbar x-scrollable style="margin-bottom: -10px">
                  <div style="padding-bottom: 15px">
                    <n-code :code="detailData[item.case_name].ans" />
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
