<template>
  <a-layout class="h-100 mt-60">
    <a-layout-content class="main-container">
      <slot/><sync-btn/>
    </a-layout-content>
    <a-layout-footer class="btm-tabbar">
      <a-button
        v-for="btn in buttons" :key="btn.id" type="link"
        :class="['btm-tab-btn', {'act-tab-btn': actTab === btn.id}]"
        @click="$router.push({path: btn.href})"
      >
        <a-icon :type="btn.icon" style="font-size: 15pt"/>
        <p class="mb-0">{{btn.name}}</p>
      </a-button>
    </a-layout-footer>
  </a-layout>
</template>

<script>
import syncBtn from './syncBtn.vue'
export default {
  components: {
    'sync-btn': syncBtn
  },
  props: {
    actTab: {
      type: String,
      default: 'home'
    }
  },
  data () {
    return {
      buttons: [{
        id: 'home',
        name: '首页',
        icon: 'home',
        href: '/eth-admin/home'
      }, {
        id: 'trade',
        name: '交易',
        icon: 'transaction',
        href: '/eth-admin/trade'
      }]
    }
  }
}
</script>

<style>
.main-container {
  position: absolute;
  top: 0;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: rgba(.1, .1, .1, .1);
  overflow-y: scroll;
  padding: 5px;
}

.btm-tabbar {
  position: fixed;
  height: 50px;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 !important;
  display: flex!important;
  justify-content: space-around!important;
}

.btm-tab-btn {
  width: 100%;
  height: 100% !important;
  border-radius: 0;
}

.act-tab-btn {
  background-color: rgba(.1, .1, .1, .1)
}
</style>
