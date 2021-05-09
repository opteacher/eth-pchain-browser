import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Detail from '@/pages/detail'
import Trade from '@/pages/trade'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    redirect: '/eth-admin/home'
  }, {
    path: '/eth-admin/home',
    component: Home
  }, {
    path: '/eth-admin/detail',
    component: Detail
  }, {
    path: '/eth-admin/trade',
    component: Trade
  }]
})
