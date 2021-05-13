<template>
  <a-page-header
    class="ajst-hd-btn"
    :class="{'no-bk-arrow': !hasBack}"
    style="border: 1px solid rgb(235, 237, 240)"
    :title="title"
    :sub-title="subTitle"
    @back="$router.go(-1)"
  >
    <template slot="tags">
      <a-tag :color="$store.state.syncing.value ? 'blue' : 'red'" @click="onSyncBlicked">
        {{$store.state.syncing.value ? '同步中' : '停止中'}}
      </a-tag>
    </template>
    <template slot="extra">
      <a-button class="ant-btn-icon-only" shape="circle"
        :type="$store.state.mining.value ? 'primary' : 'default'"
        @click="onMineToggled" :disabled="dsbTgrMine"
      >
        <mine-icon/>
      </a-button>
      <a-button shape="circle" icon="home" @click="$router.push({path: '/eth-pchain/home'})"/>
    </template>
  </a-page-header>
</template>

<script>
import mineIcon from './mineIcon.vue'
import utils from '../utils'
export default {
  components: {
    'mine-icon': mineIcon
  },
  props: {
    hasBack: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '详情页'
    },
    subTitle: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dsbTgrMine: false
    }
  },
  methods: {
    onSyncBlicked () {
      this.$store.commit('TOGGLE_SYNC')
    },
    async onMineToggled () {
      this.dsbTgrMine = true
      const mining = !this.$store.state.mining.value
      await utils.reqChain(`miner_${mining ? 'start' : 'stop'}`)
      const self = this
      const h = setInterval(() => {
        if (mining === self.$store.state.mining.value) {
          self.dsbTgrMine = false
          clearInterval(h)
        }
      }, 500)
    }
  }
}
</script>

<style>
.ajst-hd-btn .ant-page-header-heading-extra {
  float: right !important;
  width: auto !important;
  padding-top: 0 !important;
}
.no-bk-arrow .ant-page-header-back {
  display: none;
}
</style>
