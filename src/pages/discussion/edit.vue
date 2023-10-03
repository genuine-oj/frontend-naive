<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Axios from '@/plugins/axios';
import router from '@/router';
import MdEditor from '@/components/MdEditor.vue';
import Captcha from '../../components/captcha.vue';

const route = useRoute(),
  message = useMessage();
const id = route.params.id;

const discussion = ref({
    related_content_type: 'none',
    related_content_id: null,
    title: '',
    content: '',
    captcha: '',
  }),
  captchaRef = ref(null);
if (route.query.related_problem__id) {
  discussion.value.related_content_type = 'problem';
  discussion.value.related_content_id = route.query.related_problem__id;
} else if (route.query.related_contest__id) {
  discussion.value.related_content_type = 'contest';
  discussion.value.related_content_id = route.query.related_contest__id;
}

// if (id) {
//   Axios.get(`/contest/${id}/`).then(res => {
//     discussion.value = res;
//   });
// }

const submiting = ref(false);
const submit = async () => {
  if (!discussion.value.title) {
    message.warning('讨论标题不能为空');
    return;
  } else if (
    discussion.value.related_content_type !== 'none' &&
    isNaN(parseInt(discussion.value.related_content_id))
  ) {
    message.warning('关联内容ID不能为空');
    return;
  }
  if (!(await captchaRef.value.checkCaptcha())) return;
  submiting.value = true;
  let req;
  if (id) req = Axios.put(`/discussion/${id}/`, data);
  else req = Axios.post('/discussion/', discussion.value);
  req
    .then(res => {
      if (!id) {
        message.success('创建成功');
        router.push({ name: 'discussion_detail', params: { id: res.id } });
      } else message.success('修改成功');
    })
    .finally(() => {
      submiting.value = false;
    });
};

const deleteDiscussion = () => {
  Axios.delete(`/discussion/${id}/`).then(() => {
    message.success('删除成功！');
    router.push({ name: 'contest_list' });
  });
};
</script>

<template>
  <h1>
    <n-space style="align-items: center" size="large">
      创建讨论
      <!-- <n-button
        v-if="id"
        @click="router.push({ name: 'contest_detail', params: { id } })"
        style="display: flex; align-items: center"
      >
        返回
      </n-button> -->
    </n-space>
  </h1>

  <n-divider />

  <n-space vertical size="large">
    <div>
      <h2>讨论标题</h2>
      <n-input
        v-model:value="discussion.title"
        placeholder="请输入标题"
        size="large"
      />
    </div>
    <div>
      <h2>关联内容</h2>
      <n-space vertical size="large">
        <n-radio-group
          v-model:value="discussion.related_content_type"
          name="radiogroup"
        >
          <n-space>
            <n-radio :value="'none'">无</n-radio>
            <n-radio :value="'problem'">题目</n-radio>
            <n-radio :value="'contest'">比赛（题单）</n-radio>
          </n-space>
        </n-radio-group>
        <n-input
          v-model:value="discussion.related_content_id"
          v-if="discussion.related_content_type !== 'none'"
          :placeholder="`请输入${
            discussion.related_content_type === 'problem'
              ? '问题'
              : '比赛（题单）'
          }ID`"
        />
      </n-space>
    </div>
    <div>
      <h2>讨论正文</h2>
      <MdEditor v-model:content="discussion.content" />
    </div>
    <!-- <div>
      <h2>其它设置</h2>
      <n-row style="padding: 0 1px">
        <n-col :span="4">
          <h3>是否隐藏</h3>
          <n-switch v-model:value="discussion.is_hidden" />
        </n-col>
      </n-row>
    </div> -->
  </n-space>

  <n-divider />

  <Captcha
    scene="discussion"
    v-model:captcha="discussion.captcha"
    ref="captchaRef"
  />

  <n-divider />

  <n-space>
    <n-button
      type="primary"
      size="large"
      @click="submit"
      :loading="submiting"
      :disabled="submiting"
    >
      保存
    </n-button>
    <!-- <n-popconfirm @positive-click="deleteContest" v-if="id">
      <template #trigger>
        <n-button type="error" size="large"> 删除 </n-button>
      </template>
      您确认要删除{{ discussion.problem_list_mode ? '题单' : '比赛' }}
      {{ discussion.title }} 吗？该操作不可撤销。
    </n-popconfirm> -->
  </n-space>
</template>
