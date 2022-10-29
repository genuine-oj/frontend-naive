<template>
  <n-card :bordered="false" class="md-editor-card">
    <MdEditor
      v-model="_content"
      katexJs="https://cdn.staticfile.org/KaTeX/0.15.1/katex.min.js"
      katexCss="https://cdn.staticfile.org/KaTeX/0.15.1/katex.min.css"
      highlightJs="https://cdn.staticfile.org/highlight.js/11.2.0/highlight.min.js"
      highlightCss="https://cdn.staticfile.org/highlight.js/10.0.0/styles/atom-one-dark.min.css"
      noMermaid
      prettierCDN="https://cdn.staticfile.org/prettier/2.0.3/standalone.min.js"
      prettierMDCDN="https://cdn.staticfile.org/prettier/2.0.3/parser-markdown.min.js"
      noCropper
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
        '-',
        'preview',
      ]"
      :preview="true"
      :previewOnly="previewOnly"
      :historyLength="20"
      showCodeRowNumber
      previewTheme="vuepress"
      :theme="store.state.theme"
    />
  </n-card>
</template>

<script setup>
import MdEditor from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { computed, ref, toRef, watch } from 'vue';
import store from '@/store';

const emit = defineEmits(['update:content']);
const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  previewOnly: {
    type: Boolean,
    default: false,
  },
});

const _content = ref(props.content);
watch(_content, val => emit('update:content', val));
watch(toRef(props, 'content'), val => (_content.value = val));
</script>

<style>
#md-editor-v3 {
  background-color: var(--n-color);
  color: var(--n-text-color);
  transition: color 0.3s var(--n-bezier), background-color 0.3s var(--n-bezier),
    box-shadow 0.3s var(--n-bezier), border-color 0.3s var(--n-bezier);
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
.n-card.md-editor-card .n-card__content {
  margin: 0 !important;
  padding: 0 !important;
}
</style>