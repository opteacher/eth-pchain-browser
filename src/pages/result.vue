<template>
  <a-result
    status="success"
    title="转账成功!"
  >
    <div slot="subTitle">
      <p class="mb-0">交易哈希为</p>
      <a-row>
        <a-col :span="22">
          <p class="long-hash">
            {{$route.query.txHash}}
          </p>
        </a-col>
        <a-col :span="2">
          <a-button class="p-0" type="link">
            <a-icon type="copy"/>
          </a-button>
        </a-col>
      </a-row>
    </div>
    <template #extra>
      <a-button key="console" type="primary"  @click="$router.push({
        path: `/eth-admin/detail?type=txHash&q=${$route.query.txHash}`
      })">
        查看交易详情
      </a-button>
      <a-button key="buy" @click="$router.push({path: '/eth-admin/trade'})">
        再次发起转账
      </a-button>
    </template>
  </a-result>
</template>

<script>
export default {
  created () {
    this.$store.commit({
      type: 'setCurrentVue',
      instance: this
    })
  }
}
</script>
