<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';
import store from '@/store';

import { _writeSearchToQuery } from '@/plugins/utils';
import SubmissionTable from '@/components/SubmissionTable.vue';
import ContestTable from '@/components/ContestTable.vue';
import DiscussionTable from '@/components/DiscussionTable.vue';

const yiyan = ref({}),
  loadingYiyan = ref(false);
const getYiyan = async () => {
  loadingYiyan.value = true;
  const time = Date.now();

  let res;
  if (store.state.displaySettings.sentenceApi === 'hitokoto') {
    res = await Axios.get('https://v1.hitokoto.cn/?encode=json').then(res => {
      res.provenance = res.from;
      res.author = res.from_who;
      res.content = res.hitokoto;
      return res;
    });
  } else {
    res = await Axios.get('https://api.yixiangzhilv.com/yiyan/sentence/get/');
  }

  if (res.provenance && res.author) {
    res.from_show = `${res.provenance} · ${res.author}`;
  } else {
    res.from_show = `${res.provenance || res.author}`;
  }
  setTimeout(() => {
    yiyan.value = res;
    loadingYiyan.value = false;
  }, Math.max(0, 300 - (Date.now() - time)));
};
getYiyan();

const contest_data = ref([]);
Axios.get('/contest/', {
  params: {
    limit: 3,
    offset: 0,
    user__username: store.state.user.username,
  },
}).then(res => {
  contest_data.value = res.results;
})

const submission_data = ref([]);
Axios.get('/submission/', {
  params: {
    limit: 10,
    offset: 0,
    user__username: store.state.user.username,
  },
}).then(res => {
  submission_data.value = res.results;
})

const discussion_data = ref([]);
Axios.get('/discussion/', {
  params: {
    limit: 5,
    offset: 0,
    user__username: store.state.user.username,
  },
}).then(res => {
  discussion_data.value = res.results;
})
</script>

<template>
  <n-layout-content :style="{
    display:store.getters.loggedIn?'none':'block',
  }">
    <div
      :style="{
        height: 'calc(100vh - 250px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: 'all 0.5s',
        opacity: !loadingYiyan ? 1 : 0,
      }"
      @click="getYiyan"
    >
      <h1 style="text-align: center">
        <n-gradient-text
          :type="
            ['primary', 'info', 'danger', 'warning', 'success'][
              parseInt((Math.random() * 1000) % 5)
            ]
          "
        >
          <div style="letter-spacing: 2px; font-weight: 600">
            {{ yiyan.content }}
          </div>
          <div
            v-show="yiyan.from_show"
            style="margin-top: 50px; letter-spacing: 2px"
          >
            - 「 {{ yiyan.from_show }} 」
          </div>
        </n-gradient-text>
      </h1>
    </div>
  </n-layout-content>
  <n-layout-content :style="{
    display:store.getters.loggedIn?'block':'none',
  }">
    <div style="display: flex;">
      <div style="width: 76%;">
        <h2>最近的比赛&题单</h2>
        <ContestTable :data="contest_data" />
      </div>
      <div style="width: 30%;margin-left: 10px;">
        <n-card style="width: 100%;" content-style="padding: 0px;">
          <div :style="{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            transition: 'all 0.5s',
            opacity: !loadingYiyan ? 1 : 0,
          }" @click="getYiyan">
            <p style="text-align: center">
              <n-gradient-text :type="['primary', 'info', 'danger', 'warning', 'success'][
                parseInt((Math.random() * 1000) % 5)
                ]
                ">
                <div>
                  {{ yiyan.content }}
                </div>
                <div v-show="yiyan.from_show">
                  - 「 {{ yiyan.from_show }} 」
                </div>
              </n-gradient-text>
            </p>
          </div>
        </n-card>
        <n-card title="搜索题目" style="width: 100%;margin-top: 17px;" size="huge">
          <n-input placeholder="请输入" />
          <n-button style="margin-top: 10px;" @click="search" type="primary"> 搜索 </n-button>
        </n-card>
      </div>
    </div>
    <div style="display: flex;">
      <div style="width: 100%;">
        <h2>最近的讨论</h2>
        <DiscussionTable :data="discussion_data" />
      </div>
    </div>
    <div style="display: flex;">
      <div style="width: 100%;">
        <h2>我最近的提交</h2>
        <SubmissionTable :data="submission_data" />
      </div>
    </div>
  </n-layout-content>
</template>
