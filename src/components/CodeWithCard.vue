<template>
  <n-card>
    <n-scrollbar x-scrollable style="margin-bottom: -10px">
      <div style="padding-bottom: 10px">
        <n-code :code="code" />
      </div>
    </n-scrollbar>
  </n-card>
</template>

<script setup>
defineProps({
  code: {
    type: String,
    default: '',
  },
});
</script>
