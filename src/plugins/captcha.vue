<script setup>
import config from '@/config';
import { useReCaptcha } from 'vue-recaptcha-v3';
import { Hccaptcha } from 'hccaptcha-vue';

const message = useMessage();
let executeRecaptcha, recaptchaLoaded;
if (config.captcha.enabled && config.captcha.type === 'recaptcha-v3') {
  const RECAPTCHA = useReCaptcha();
  executeRecaptcha = RECAPTCHA.executeRecaptcha;
  recaptchaLoaded = RECAPTCHA.recaptchaLoaded;
}

const emit = defineEmits(['update:captcha']);
const props = defineProps({
  captcha: {
    type: String,
    default: '',
  },
  scene: {
    type: String,
    default: '',
  },
});

const code = ref(undefined);

const checkCaptcha = async () => {
  if (!config.captcha.enabled) return true;
  if (!config.captcha.scenes.includes(props.scene)) return true;

  if (config.captcha.type === 'recaptcha-v3') {
    await recaptchaLoaded();
    const token = await executeRecaptcha(props.scene);
    emit('update:captcha', token);
    return true;
  } else if (config.captcha.type === 'hccaptcha') {
    if (!code.value) {
      message.error('请先完成人机验证');
      return false;
    }
    emit('update:captcha', code.value);
    return true;
  }
};

defineExpose({
  checkCaptcha,
});
</script>

<template>
  <div
    v-if="config.captcha.enabled && config.captcha.scenes.includes(props.scene)"
  >
    <n-form-item v-if="config.captcha.type === 'hccaptcha'">
      <Hccaptcha style="width: 100%" v-model:code="code" />
    </n-form-item>
  </div>
</template>
