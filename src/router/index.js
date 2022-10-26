import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/index.vue'),
    meta: {
      title: '首页',
      cate: 'index',
    },
  },
  {
    path: '/user/login',
    name: 'login',
    component: () => import('@/pages/user/login.vue'),
    meta: {
      title: '登录',
      cate: 'login',
    },
  },
  {
    path: '/submission/',
    name: 'submission_index',
    component: () => import('@/pages/submission/index.vue'),
    meta: {
      title: '提交',
      cate: 'submission',
      requiredLogin: true,
    },
  },
  {
    path: '/submission/:id',
    name: 'submission_show',
    component: () => import('@/pages/submission/_id.vue'),
    meta: {
      title: '提交详情',
      cate: 'submission',
      requiredLogin: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

NProgress.configure({
  showSpinner: false,
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (to.meta.requiredLogin && !store.getters.loggedIn) {
    window.$message.warning('请先登录');
    next({ name: 'login', query: { next: to.path } });
  } else next();
});

router.afterEach(() => {
  NProgress.done();
});

export { router };
export default router;
