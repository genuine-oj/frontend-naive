<script setup>
import Axios from '@/plugins/axios';
import { ref } from 'vue';

const yiyan = ref({});
Axios.get('https://api.yixiangzhilv.com/yiyan/sentence/get/').then(res => {
  if (res.provenance && res.author) {
    res.from_show = `${res.provenance} · ${res.author}`;
  } else {
    res.from_show = `${res.provenance || res.author}`;
  }
  yiyan.value = res;
});
</script>

<template>
  <n-layout-content>
    <div
      :style="{
        height: 'calc(100vh - 250px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: 'all 0.5s',
        opacity: yiyan.content ? 1 : 0,
      }"
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
</template>
