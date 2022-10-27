<template>
  <n-card>
    <n-scrollbar x-scrollable style="margin-bottom: -10px">
      <div style="padding-bottom: 15px">
        <n-code
          v-if="language"
          :code="code"
          :language="language"
          show-line-numbers
        />
      </div>
    </n-scrollbar>
  </n-card>
</template>

<script setup>
import { defineProps } from 'vue';
defineProps({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  showLineNumbers: {
    type: Boolean,
    required: true,
  },
});
</script>
