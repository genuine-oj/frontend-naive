import { createRouter, createWebHistory } from 'vue-router';
import config from '../../config';
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
    name: 'problem_list',
    component: () => import('@/pages/problem/index.vue'),
    meta: {
      title: '题目列表',
      cate: 'problem',
    },
  },
  {
    path: '/problem/:id/',
    name: 'problem_detail',
    component: () => import('@/pages/problem/_id.vue'),
    meta: {
      title: '题目详情 #{id}',
      cate: 'problem',
      requiredLogin: true,
    },
  },
  {
    path: '/problem/create/',
    name: 'problem_create',
    component: () => import('@/pages/problem/edit.vue'),
    meta: {
      title: '创建题目',
      cate: 'problem',
      requiredLogin: true,
      requiredAdmin: true,
    },
  },
  {
    path: '/problem/:id/edit/',
    name: 'problem_edit',
    component: () => import('@/pages/problem/edit.vue'),
    meta: {
      title: '编辑题目 #{id}',
      cate: 'problem',
      requiredLogin: true,
      requiredAdmin: true,
    },
  },
  {
    path: '/contest/',
    name: 'contest_list',
    component: () => import('@/pages/contest/index.vue'),
    meta: {
      title: '比赛列表',
      cate: 'contest',
    },
  },
  {
    path: '/contest/:id/',
    name: 'contest_detail',
    component: () => import('@/pages/contest/_id.vue'),
    meta: {
      title: '比赛详情 #{id}',
      cate: 'contest',
      requiredLogin: true,
    },
  },
  {
    path: '/contest/create/',
    name: 'contest_create',
    component: () => import('@/pages/contest/edit.vue'),
    meta: {
      title: '创建比赛',
      cate: 'contest',
      requiredLogin: true,
      requiredAdmin: true,
    },
  },
  {
    path: '/contest/:id/edit/',
    name: 'contest_edit',
    component: () => import('@/pages/contest/edit.vue'),
    meta: {
      title: '编辑比赛 #{id}',
      cate: 'contest',
      requiredLogin: true,
      requiredAdmin: true,
    },
  },

  {
    path: '/submission/',
    name: 'submission_list',
    component: () => import('@/pages/submission/index.vue'),
    meta: {
      title: '提交列表',
      cate: 'submission',
      requiredLogin: true,
    },
  },
  {
    path: '/submission/:id/',
    name: 'submission_detail',
    component: () => import('@/pages/submission/_id.vue'),
    meta: {
      title: '提交详情 #{id}',
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

router.afterEach(to => {
  if (to.meta.title) {
    const title = to.meta.title.replace(/\{(.+?)\}/g, (match, p1) => {
      return to.params[p1];
    });
    document.title = `${title} - ${config.title}`;
  } else {
    document.title = config.title;
  }
  NProgress.done();
});

export { router };
export default router;
