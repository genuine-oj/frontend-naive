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
      theme: 'dark',
      displaySettings: { markdownTheme: 'vuepress' },
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
