import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import enhance from './modules/enhance'
import online from './modules/online'
import getters from './getters'

import prod from './modules/prod'
import common from './modules/common'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    enhance,
    online,
    prod,
    common
  },
  state: {

  },
  mutations: {

  },
  actions: {

  },
  getters
})