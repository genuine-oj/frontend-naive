import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';

const vuexPersistState = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({
    user: state.user,
    theme: state.theme,
    displaySettings: state.displaySettings,
  }),
});

const store = createStore({
  state() {
    return {
      user: {},
      displaySettings: {
        theme: 'dark',
        markdownTheme: 'vuepress',
        sentenceApi: 'hitokoto',
        lock: false,
      },
    };
  },
  mutations: {
    setUser(state, data) {
      state.user = data;
    },
    logout(state) {
      state.user = {};
    },
    changeTheme(state) {
      state.displaySettings.theme =
        state.displaySettings.theme === 'light' ? 'dark' : 'light';
      state.displaySettings.lock = true;
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
  },
  getters: {
    loggedIn: state => state.user && state.user.id,
  },
  plugins: [vuexPersistState.plugin],
});

export { store };
export default store;
