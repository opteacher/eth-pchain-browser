import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Detail from '@/pages/detail'
import Trade from '@/pages/trade'
import Result from '@/pages/result'
import Solidity from '@/pages/solidity'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    redirect: '/eth-pchain/home'
  }, {
    path: '/eth-pchain/home',
    component: Home
  }, {
    path: '/eth-pchain/detail',
    component: Detail
  }, {
    path: '/eth-pchain/trade',
    component: Trade
  }, {
    path: '/eth-pchain/result',
    component: Result
  }, {
    path: '/eth-pchain/solidity',
    component: Solidity
  }]
})
