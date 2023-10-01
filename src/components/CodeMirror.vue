<script setup>
import { ref } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import store from '@/store';
const extensions = { python3: [python()], cpp: [cpp()], c: [cpp()] };

const emit = defineEmits(['update:code']);
const props = defineProps({
  language: {
    type: String,
    default: 'cpp',
  },
  code: {
    type: String,
    default: '',
  },
});

const _code = ref(props.code);
watch(_code, val => emit('update:code', val));
</script>

<template>
  <codemirror
    v-model="_code"
    placeholder="请输入你的代码..."
    :style="{ height: '600px', fontSize: '16px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="4"
    :extensions="
      (extensions[language] ?? []).concat(
        store.getters.theme === 'dark' ? [oneDark] : []
      )
    "
  />
</template>

<style lang="scss" scoped>
:deep(.ͼ1.cm-editor.cm-focused) {
  outline: none;
}

:deep(.ͼ1.cm-editor div),
:deep(.ͼ1.cm-editor span) {
  font-family: 'SourceCodePro';
}
</style>
