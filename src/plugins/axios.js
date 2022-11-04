import axios from 'axios';
import router from '@/router';
import store from '@/store';
import { useRoute } from 'vue-router';

export const Axios = axios.create({
  baseURL: '/api',
});

Axios.interceptors.request.use(
  async config => {
    if (config.url.indexOf('http') !== 0) {
      if (store.state.jwt) {
        config.headers.Authorization = store.state.jwt;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  response => response.data,
  async error => {
    if (!error.response) {
      window.$message.error(error.message);
      return Promise.reject(error.message);
    } else if (error.response.status === 405) {
      window.$message.info(
        '恭喜你找到了开发者写的一个脑残Bug（认真的），请联系开发者，谢谢！'
      );
      return Promise.reject(error.response);
    } else if (error.response.status === 404) {
      window.$message.error('资源不存在');
      return Promise.reject(error.response);
    } else if (error.response.status === 403) {
      if (!store.getters.loggedIn) {
        if (router.currentRoute.value.name !== 'login') {
          window.$message.warning('请先登录');
          store.commit('logout');
          router.push({
            name: 'login',
            query: { next: router.options.history.location },
          });
        }
        return;
      }
      if (error.response.data.message) {
        window.$message.error(error.response.data.message);
        return Promise.reject(error.response.data.message);
      }
      window.$message.error('身份校验失败');
      return Promise.reject('身份校验失败');
    }
    const reason =
      error.response.data.message ??
      error.response.data.detail ??
      error.response.data[0];
    if (error.response.status === 400) {
      if (reason) window.$message.error(reason);
      return Promise.reject(reason);
    } else if (error.response.status === 500) {
      window.$message.error('服务器错误');
      return Promise.reject('服务器错误');
    } else {
      return Promise.reject(reason);
    }
  }
);

export default Axios;
