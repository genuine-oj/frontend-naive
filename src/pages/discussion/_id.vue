<script setup>
import { ref } from 'vue';
import Axios from '@/plugins/axios';
import { useRoute } from 'vue-router';
import ContestTable from '@/components/ContestTable.vue';
import ProblemTable from '@/components/ProblemTable.vue';
import MdEditor from '@/components/MdEditor.vue';
import Captcha from '../../components/captcha.vue';

const route = useRoute(),
  message = useMessage();

const id = route.params.id,
  discussion = ref({});

const loadData = () => {
  Axios.get(`/discussion/${id}/`).then(res => {
    discussion.value = res;
  });
};
loadData();

let page = 1;
const replies = ref([]),
  loading = ref(false),
  noMore = ref(false);
const loadReply = () => {
  if (loading.value || noMore.value) return;
  loading.value = true;
  Axios.get(`/discussion/${id}/reply/?page=${page}`)
    .then(res => {
      while (res[0].id <= replies.value[replies.value.length - 1]?.id) {
        res.shift();
      }
      replies.value.push(...res);
      page++;
    })
    .catch(err => {
      if (err.status === 404) {
        noMore.value = true;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
loadReply();

const newReply = ref({
    content: '',
    reply_to: null,
    captcha: '',
  }),
  captchaRef = ref(null);
const replyTo = (reply_id, go = true) => {
  const match = newReply.value.content.match(/^Reply to #\d+\n+/);
  if (match) {
    newReply.value.content = newReply.value.content.replace(match[0], '');
  }
  newReply.value.content.trimStart();
  newReply.value.content = `Reply to #${reply_id}\n\n${newReply.value.content}`;
  if (go) {
    document.getElementById('new-reply').scrollIntoView();
  }
};
const submitReply = async () => {
  const match = newReply.value.content.match(/^Reply to #(\d+)\n+/);
  if (match) {
    newReply.value.reply_to = parseInt(match[1]);
    newReply.value.content = newReply.value.content.replace(match[0], '');
  }
  if (!(await captchaRef.value.checkCaptcha())) return;
  Axios.post(`/discussion/${id}/reply/`, newReply.value)
    .then(() => {
      message.success('回复成功');
      newReply.value.content = '';
      if (page !== 1) page--;
      noMore.value = false;
      loadReply();
    })
    .catch(err => {
      message.error(err.response.data);
    });
};

const goto = reply_id => {
  const element = document.getElementById(`reply-card-${reply_id}`);
  if (element) {
    element.scrollIntoView();
  } else {
    message.error('找不到原贴');
  }
};
</script>

<template>
  <h1>{{ discussion.title }}</h1>
  <n-collapse>
    <n-collapse-item
      title="关联问题"
      name="related_problem"
      v-if="discussion.related_problem"
    >
      <ProblemTable :data="[discussion.related_problem]" />
    </n-collapse-item>
    <n-collapse-item
      title="关联比赛"
      name="related_contest"
      v-if="discussion.related_contest"
    >
      <ContestTable :data="[discussion.related_contest]" />
    </n-collapse-item>
  </n-collapse>

  <n-divider />

  <n-card
    class="reply"
    v-for="reply in replies"
    :key="reply.id"
    :id="`reply-card-${reply.id}`"
    embedded
    :segmented="{
      content: 'soft',
      action: true,
    }"
  >
    <template #header>
      <router-link
        :to="{ name: 'user_detail', params: { id: reply.author.id } }"
        class="reply-header"
      >
        <n-space>
          <n-avatar
            :src="reply.author.avatar"
            size="small"
            round
            v-if="reply.author.avatar"
          />
          {{ reply.author.username }}
        </n-space>
      </router-link>
    </template>
    <template #header-extra>
      <n-time :time="new Date(reply.create_time)" />
    </template>
    <MdEditor :content="reply.content" previewOnly />
    <template #footer>
      <div v-if="reply.reply_to">
        回复给
        <router-link
          :to="{
            name: 'user_detail',
            params: { id: reply.reply_to.author.id },
          }"
        >
          <n-button text> @{{ reply.reply_to.author.username }} </n-button>
        </router-link>
        ，
        <n-button text @click="goto(reply.reply_to.id)"> 查看原贴 </n-button>
      </div>
    </template>
    <template #action>
      <n-button-group size="small">
        <n-button @click="replyTo(reply.id)">回复</n-button>
      </n-button-group>
    </template>
  </n-card>
  <div
    style="display: flex; justify-content: center; margin: 2rem 0"
    v-if="replies.length"
  >
    <n-button
      size="large"
      :loading="loading"
      :disabled="loading || noMore"
      @click="loadReply"
    >
      {{ noMore ? '加载完成' : '加载更多' }}
    </n-button>
  </div>

  <n-divider />

  <div>
    <h2>新回复</h2>
    <p>第一行“Reply to #X”格式的内容会在发布时自动转义和消去。</p>
    <p>暂不支持@用户。</p>
    <MdEditor v-model:content="newReply.content" />
    <Captcha
      scene="discussion"
      v-model:captcha="newReply.captcha"
      ref="captchaRef"
    />
    <n-button
      id="new-reply"
      type="primary"
      size="large"
      @click="submitReply"
      style="margin: 1.5rem 0"
    >
      发布
    </n-button>
  </div>
</template>

<style lang="scss" scoped>
.reply {
  margin-bottom: 1rem;
  .reply-header {
    text-decoration: none;
    color: inherit;
    .n-space {
      display: inline-flex !important;
    }
  }
  :deep(.n-card__action) {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  :deep(.n-card-header) {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
</style>
