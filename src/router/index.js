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
    path: '/user/login/',
    name: 'login',
    component: () => import('@/pages/user/login.vue'),
    meta: {
      title: '登录',
      cate: 'login',
    },
  },
  {
    path: '/problem/',
    name: 'problem_index',
    component: () => import('@/pages/problem/index.vue'),
    meta: {
      title: '题目',
      cate: 'problem',
    },
  },
  {
    path: '/problem/:id/',
    name: 'problem_detail',
    component: () => import('@/pages/problem/_id.vue'),
    meta: {
      title: '题目详情',
      requiredLogin: true,
    },
  },
  {
    path: '/problem/edit/',
    name: 'problem_edit',
    component: () => import('@/pages/problem/edit.vue'),
    meta: {
      title: '编辑题目',
      requiredLogin: true,
      requiredAdmin: true,
    },
  },
  {
    path: '/problem/:id/edit/',
    name: 'problem_edit',
    component: () => import('@/pages/problem/edit.vue'),
    meta: {
      title: '编辑题目',
      requiredLogin: true,
      requiredAdmin: true,
    },
  },
  {
    path: '/problem/:id/edit-data/',
    name: 'problem_edit_data',
    component: () => import('@/pages/problem/edit-data.vue'),
    meta: {
      title: '编辑题目数据',
      requiredLogin: true,
      requiredAdmin: true,
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
    path: '/submission/:id/',
    name: 'submission_detail',
    component: () => import('@/pages/submission/_id.vue'),
    meta: {
      title: '提交详情',
      cate: 'submission',
      requiredLogin: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
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
  } else if (to.meta.requiredAdmin && !store.state.user.is_staff) {
    window.$message.error('该页面需要管理员权限！');
    NProgress.done();
  } else next();
});

router.afterEach(() => {
  NProgress.done();
});

export { router };
export default router;
