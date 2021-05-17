import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Detail from '@/pages/detail'
import Trade from '@/pages/trade'
import Result from '@/pages/result'
import Solidity from '@/pages/solidity'
import CallSend from '@/pages/callSend'

Vue.use(Router)

export default new Router({
  base: '/distribute/',
  mode:'history',
  routes: [{
    path: '/',
    redirect: '/home'
  }, {
    path: '/home',
    component: Home
  }, {
    path: '/detail',
    component: Detail
  }, {
    path: '/trade',
    component: Trade
  }, {
    path: '/result',
    component: Result
  }, {
    path: '/solidity',
    component: Solidity
  }, {
    path: '/solidity/call-send',
    component: CallSend
  }]
})
