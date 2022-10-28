<script setup>
import { ref } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
const extensions = { python: [python()], cpp: [cpp()], c: [cpp()] };

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
    :extensions="extensions[language]"
  />
</template>

<style lang="scss">
@font-face {
  font-family: 'SourceCodePro';
  src: url('https://cdn.jsdelivr.net/npm/source-code-pro@2.38.0/TTF/SourceCodePro-Regular.ttf')
    format('truetype');
  font-weight: normal;
  font-style: normal;
}

.ͼ1.cm-editor.cm-focused {
  outline: none;
}

.ͼ1.cm-editor div,
.ͼ1.cm-editor span {
  font-family: 'SourceCodePro';
}

.ͼ2 .cm-gutters {
  background-color: var(--n-color);
  transition: color 0.3s var(--n-bezier), background-color 0.3s var(--n-bezier),
    box-shadow 0.3s var(--n-bezier), border-color 0.3s var(--n-bezier);
}
</style>
