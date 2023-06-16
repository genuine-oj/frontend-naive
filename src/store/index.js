import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';
import config from '../../config';

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
      theme: config.defaultTheme,
      displaySettings: {
        markdownTheme: config.defaultMarkdownTheme,
        sentenceApi: config.defaultSentenceApi,
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
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setDisplaySettings(state, data) {
      state.displaySettings = data;
    },
  },
  getters: {
    loggedIn: state => state.user && state.user.id,
  },
  plugins: [vuexPersistState.plugin],
});

export { store };
export default store;
