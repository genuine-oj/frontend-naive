<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';
import store from '@/store';

const yiyan = ref({}),
  loadingYiyan = ref(false);
const getYiyan = async () => {
  loadingYiyan.value = true;
  const time = Date.now();

  let res;
  if (store.state.displaySettings.sentenceApi === 'hitokoto') {
    res = await Axios.get('https://v1.hitokoto.cn/?encode=json').then(res => {
      res = JSON.parse(res);
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
</script>

<template>
  <n-layout-content>
    <div :style="{
      height: 'calc(100vh - 250px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      transition: 'all 0.5s',
      opacity: !loadingYiyan ? 1 : 0,
    }" @click="getYiyan">
      <h1 style="text-align: center">
        <n-gradient-text :type="['primary', 'info', 'danger', 'warning', 'success'][
          parseInt((Math.random() * 1000) % 5)
          ]
          ">
          <div style="letter-spacing: 2px; font-weight: 600">
            {{ yiyan.content }}
          </div>
          <div v-show="yiyan.from_show" style="margin-top: 50px; letter-spacing: 2px">
            - 「 {{ yiyan.from_show }} 」
          </div>
        </n-gradient-text>
      </h1>
    </div>
  </n-layout-content>
</template>
