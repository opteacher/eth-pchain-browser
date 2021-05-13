<template>
  <div>
    <header-res title="结果页" :hasBack="false"/>
    <a-result
      status="success"
      title="转账成功!"
    >
      <div slot="subTitle">
        <p class="mb-0">交易哈希为</p>
        <lg-hash :hash="$route.query.txHash" :width="80"/>
      </div>
      <template #extra>
        <a-button key="console" type="primary"  @click="$router.push({
          path: `/eth-pchain/detail?type=txHash&q=${$route.query.txHash}`
        })">
          查看交易详情
        </a-button>
        <a-button key="buy" @click="$router.push({path: '/eth-pchain/trade'})">
          再次发起转账
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script>
import header from '../common/header'
import lgHash from '../common/lgHash'
export default {
  components: {
    'header-res': header,
    'lg-hash': lgHash
  },
  created () {
    this.$store.commit({
      type: 'SET_CURRENT_VUE',
      instance: this
    })
  }
}
</script>
