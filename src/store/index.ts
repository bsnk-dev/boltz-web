import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    signedIn: false,
    basicAuthString: '',
    adminAPIURL: (Vue.config.devtools) ? 'http://' + window.location.hostname + ':5000' : '',
    executionAPIURL: '',
    instances: [],
    volumes: [],
  },
  mutations: {
    signedIn (state, isSignedIn) {
      state.signedIn = isSignedIn
    },
    setBasicAuthString (state, basicAuthString) {
      state.basicAuthString = basicAuthString
    },
    setInstances (state, instances) {
      state.instances = instances
    },
    setVolumes (state, volumes) {
      state.volumes = volumes
    },
    setExecutionAPIURL (state, executionAPIURL) {
      state.executionAPIURL = executionAPIURL
    },
  },
  getters: {
    isSignedIn (state) {
      return state.signedIn
    },
    basicAuthString (state) {
      return state.basicAuthString
    },
    instances (state) {
      return state.instances
    },
    volumes (state) {
      return state.volumes
    }
  },
  actions: {
    signOut(context) {
      context.commit('signedIn', false);
      context.commit('setBasicAuthString', '');
    }
  },
  modules: {
  }
})
