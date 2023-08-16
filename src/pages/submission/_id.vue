<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import store from '@/store';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { formatTime, formatSize } from '@/plugins/utils';
import { judgeStatus, noTime, noMemory } from '@/plugins/consts';
import CodeWithCard from '@/components/CodeWithCard.vue';
import SubmissionTable from '@/components/SubmissionTable.vue';

const route = useRoute(),
  message = useMessage();

const id = route.params.id,
  data = ref({}),
  detailData = ref({}),
  useSubcheck = ref(false),
  subchecks = ref([]),
  showingSubchecks = ref([]);

let interval;

const getStatus = async () => {
  const res = await Axios.get(`/submission/${id}/status/`);
  if (res.status > -3) {
    clearInterval(interval);
    loadData();
  }
};

const loadData = () => {
  Axios.get(`/submission/${id}/`).then(res => {
    subchecks.value = [];
    for (const i of res.detail) {
      if (typeof i.subcheck === 'number') {
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
      interval = setInterval(getStatus, 1000);
    }
  });
};

loadData();

onBeforeRouteLeave((to, from, next) => {
  clearInterval(interval);
  next();
});

const loadDetail = ({ name, expanded }) => {
  if (!detailData.value[name]) {
    detailData.value[name] = {};
    Axios.get(`/submission/${id}/test-point/${name}/`).then(res => {
      detailData.value[name] = res;
    });
  }
};

const downloadCase = (name, type, event) => {
  event.stopPropagation();
  const url = `/api/submission/${id}/test-point/${name}/?mode=fetch&file=${type}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${name}.${type}`);
  document.body.appendChild(link);
  link.click();
};

const copy = (text, event = undefined) => {
  if (event) event.stopPropagation();
  const input = document.createElement('textarea');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  message.success('复制成功');
};
</script>

<template>
  <h1>提交详情</h1>
  <n-layout-content v-if="data.id">
    <n-spin :show="data.status <= -3">
      <template #description>正在评测中...</template>
      <SubmissionTable :data="[data]" />
    </n-spin>
  </n-layout-content>
  <n-collapse
    style="margin-top: 20px; height: 100%"
    :default-expanded-names="['code', 'log']"
    display-directive="show"
  >
    <n-collapse-item name="code">
      <template #header>
        源代码
        <n-button
          size="small"
          class="case-download-button"
          @click="event => copy(data.source, event)"
        >
          复制
        </n-button>
      </template>
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
          :disabled="!data.allow_download"
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
          <n-spin
            :show="
              !(detailData[item.case_name] && detailData[item.case_name].in)
            "
          >
            <n-collapse :default-expanded-names="['in', 'out', 'ans']">
              <n-collapse-item title="输入" name="in">
                <template #header>
                  输入
                  <n-button
                    size="small"
                    class="case-download-button"
                    @click="event => downloadCase(item.case_name, 'in', event)"
                  >
                    下载
                  </n-button>
                </template>
                <CodeWithCard :code="detailData[item.case_name].in" />
              </n-collapse-item>
              <n-collapse-item
                name="out"
                v-if="item.status !== judgeStatus.ACCEPTED"
              >
                <template #header>
                  输出
                  <n-button
                    size="small"
                    class="case-download-button"
                    @click="event => downloadCase(item.case_name, 'out', event)"
                  >
                    下载
                  </n-button>
                </template>
                <CodeWithCard :code="detailData[item.case_name].out" />
              </n-collapse-item>
              <n-collapse-item name="ans">
                <template #header>
                  {{
                    item.status === judgeStatus.ACCEPTED
                      ? '输出 / 预期输出'
                      : ' 预期输出'
                  }}
                  <n-button
                    size="small"
                    class="case-download-button"
                    @click="event => downloadCase(item.case_name, 'ans', event)"
                  >
                    下载
                  </n-button>
                </template>
                <CodeWithCard :code="detailData[item.case_name].ans" />
              </n-collapse-item>
            </n-collapse>
          </n-spin>
        </n-collapse-item>
      </n-collapse>
    </n-collapse-item>
  </n-collapse>
</template>

<style lang="scss" scoped>
.case-download-button {
  margin-left: 10px;
  float: left;
}
</style>
