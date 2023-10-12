import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';
import config from '@/config';

const vuexPersistState = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({
    user: state.user,
    displaySettings: state.displaySettings,
    lastSubmitLanguage: state.lastSubmitLanguage,
  }),
});

const store = createStore({
  state() {
    return {
      user: { permissions: [] },
      displaySettings: {
        theme: 'auto',
        markdownTheme: 'vuepress',
        sentenceApi: 'hitokoto',
        defaultSubmitLanguage: '__last__',
        lock: false,
      },
      lastSubmitLanguage: config.defaultSubmitLanguage,
    };
  },
  mutations: {
    setUser(state, data) {
      state.user = data;
    },
    logout(state) {
      state.user = {};
    },
    setDisplaySettings(state, data) {
      Object.assign(state.displaySettings, data);
      state.displaySettings.lock = true;
    },
    updateDisplaySettings(state, data) {
      if (!state.displaySettings.lock) {
        state.displaySettings = data;
      }
      state.displaySettings.lock = true;
    },
    setSubmitLanguage(state, data) {
      state.lastSubmitLanguage = data;
    },
  },
  getters: {
    loggedIn: state => state.user && state.user.id,
    theme: state => {
      if (state.displaySettings.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        return state.displaySettings.theme;
      }
    },
    defaultSubmitLanguage: state => {
      return state.displaySettings.defaultSubmitLanguage === '__last__'
        ? state.lastSubmitLanguage
        : state.displaySettings.defaultSubmitLanguage;
    },
  },
  plugins: [vuexPersistState.plugin],
});

export { store };
export default store;
