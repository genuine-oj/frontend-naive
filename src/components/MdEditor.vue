<template>
  <MdEditor
    v-model="_content"
    noKatex
    noMermaid
    prettierCDN="https://cdn.staticfile.org/prettier/2.0.3/standalone.min.js"
    prettierMDCDN="https://cdn.staticfile.org/prettier/2.0.3/parser-markdown.min.js"
    cropperCss="https://cdn.staticfile.org/cropperjs/1.5.12/cropper.min.css"
    cropperJs="https://cdn.staticfile.org/cropperjs/1.5.12/cropper.min.js"
    :toolbars="[
      'revoke',
      'next',
      '-',
      'bold',
      'underline',
      'strikeThrough',
      'quote',
      '-',
      'link',
      'image',
      'table',
      '-',
      'save',
      '-',
      'preview',
    ]"
    :preview="true"
    :previewOnly="previewOnly"
    :historyLength="20"
    showCodeRowNumber
    previewTheme="vuepress"
    :onSave="onSave"
    :onUploadImg="onUploadImg"
    :theme="store.state.theme"
  />
</template>

<script setup>
import MdEditor from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { computed } from 'vue';
import store from '@/store';

const emit = defineEmits(['update:content']);
const props = defineProps({
  content: String,
  previewOnly: {
    type: Boolean,
    default() {
      return false;
    },
  },
  onSave: {
    type: Function,
    default() {
      return () => {};
    },
  },
  onUploadImg: {
    type: Function,
    default() {
      return () => {};
    },
  },
});
const _content = computed({
  get() {
    return props.content;
  },
  set(val) {
    emit('update:content', val);
  },
});
</script>

<style>
#md-editor-v3 {
  background-color: rgba(0, 0, 0, 0);
  color: var(--n-text-color) !important;
}
#md-editor-v3-preview > div,
p,
a,
strong {
  color: var(--n-text-color) !important;
}
#md-editor-v3 img {
  max-width: 70% !important;
  margin: 0 auto !important;
}
@media (max-width: 768px) {
  #md-editor-v3 img {
    max-width: 100% !important;
  }
}
</style>
