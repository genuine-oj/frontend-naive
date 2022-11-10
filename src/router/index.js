import { createRouter, createWebHistory } from 'vue-router';
import config from '../../config';
import store from '@/store';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home.vue'),
    meta: {
      title: '首页',
      cate: 'home',
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
    path: '/user/register/',
    name: 'register',
    component: () => import('@/pages/user/register.vue'),
    meta: {
      title: '注册',
      cate: 'register',
      requiredAdmin: !config.allowRegister,
    },
  },
  {
    path: '/user/',
    name: 'user_list',
    component: () => import('@/pages/user/index.vue'),
    meta: {
      title: '用户列表',
      cate: 'user',
      requiredLogin: true,
    },
  },
  {
    path: '/user/:id/',
    name: 'user_detail',
    component: () => import('@/pages/user/_id.vue'),
    meta: {
      title: '用户详情 #{id}',
      cate: 'user',
      requiredLogin: true,
    },
  },
  {
    path: '/user/settings/',
    name: 'user_settings',
    component: () => import('@/pages/user/settings.vue'),
    meta: {
      title: '个人设置',
      cate: 'user',
      requiredLogin: true,
    },
  },
  {
    path: '/user/:id/edit/',
    name: 'user_edit',
    component: () => import('@/pages/user/settings.vue'),
    meta: {
      title: '编辑用户 #{id}',
      cate: 'user',
      requiredLogin: true,
      requiredAdmin: true,
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
    path: '/problem/tag/',
    name: 'tag_edit',
    component: () => import('@/pages/problem/tag.vue'),
    meta: {
      title: '标签管理',
      cate: 'problem',
      requiredLogin: true,
      requiredAdmin: true,
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
      requiredLogin: true,
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
  if (
    !['home', 'login', 'register'].includes(to.name) &&
    !store.getters.loggedIn
  ) {
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
