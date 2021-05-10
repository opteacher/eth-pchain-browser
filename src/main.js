// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Axios from 'axios'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import App from './App'
import router from './router'
import global from './store'
import './common/styles.css'

Vue.config.productionTip = false
Vue.prototype.axios = Axios
Vue.use(Antd)

global.store.commit('toggleSync')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: global.store,
  components: { App },
  template: '<App/>'
})
