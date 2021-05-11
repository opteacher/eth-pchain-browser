<template>
  <div>
    <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="详情页"
      :sub-title="subTitle"
      @back="$router.go(-1)"
    />
    <div class="info-panel">
      <a-descriptions v-if="$route.query.type === 'txHash'" title="交易信息" bordered size="small">
        <a-descriptions-item label="交易哈希">
          <lg-hash :hash="$route.query.q" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="发送方">
          <lg-hash :hash="$store.state.selection.value.from || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="接收方">
          <lg-hash :hash="$store.state.selection.value.to || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="金额">
          {{$store.state.selection.value.wvalue || 0}}&nbsp;ETH
        </a-descriptions-item>
        <a-descriptions-item label="gas费">
          {{$store.state.selection.value.wgas || 0}}&nbsp;Satoshi
        </a-descriptions-item>
        <a-descriptions-item label="块高">
          {{$store.state.selection.value.wblockNumber || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="块哈希">
          <lg-hash :hash="$store.state.selection.value.blockHash || 'pending'" :width="55"/>
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions class="mb-5" title="块信息" bordered size="small"
        v-if="$route.query.type === 'blkHash' || $route.query.type === 'blhHeight'"
      >
        <a-descriptions-item label="块哈希">
          <lg-hash :hash="$store.state.selection.value.hash || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="块高">
          {{$store.state.selection.value.wnumber || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="父块哈希">
          <lg-hash :hash="$store.state.selection.value.parentHash || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="pow哈希">
          <lg-hash :hash="$store.state.selection.value.nonce || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="矿工地址">
          <lg-hash :hash="$store.state.selection.value.miner || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="难度">
          {{$store.state.selection.value.wdifficulty || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="大小">
          {{$store.state.selection.value.wsize || 0}}&nbsp;byte
        </a-descriptions-item>
        <a-descriptions-item label="总gas费">
          {{$store.state.selection.value.wgasUsed || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="生成时间">
          {{$store.state.selection.value.time || '00:00:00'}}
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions
        v-if="$route.query.type === 'blkHash' || $route.query.type === 'blhHeight'"
        layout="vertical" bordered size="small"
      >
        <a-descriptions-item label="块中交易">
          <div class="tx-list">
            <a-list size="small" item-layout="horizontal"
              :data-source="$store.state.selection.value.transactions || []"
            >
              <a slot="renderItem" slot-scope="tx, index" @click="onTxClicked(tx.hash)">
                <a-list-item>
                  <a-list-item-meta>
                    <div slot="description" style="width: 85vw">
                      <p class="no-br">{{tx.hash}}</p>
                    </div>
                  </a-list-item-meta>
                </a-list-item>
              </a>
            </a-list>
          </div>
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions class="mb-5" title="账户信息" bordered size="small"
        v-if="$route.query.type === 'address'"
      >
        <a-descriptions-item label="地址">
          <lg-hash :hash="$route.query.q" :width="60"/>
        </a-descriptions-item>
        <a-descriptions-item label="余额">
          {{$store.state.selection.value.wbalance || 0}}&nbsp;ETH
        </a-descriptions-item>
      </a-descriptions>
    </div>
    <sync-btn/>
  </div>
</template>

<script>
import lgHash from '../common/lgHash'
import syncBtn from '../common/syncBtn'
export default {
  name: 'detail',
  inject: ['reload'],
  components: {
    'lg-hash': lgHash,
    'sync-btn': syncBtn
  },
  data () {
    return {
      subTitle: ''
    }
  },
  watch: {
    '$store.state.selection.value.wbalance': function (o, n) {
      console.log(o, n)
    }
  },
  created () {
    this.$store.commit({
      type: 'setCurrentVue',
      instance: this
    })

    switch (this.$route.query.type) {
      case 'txHash':
        this.subTitle = '交易详情'
        this.$store.commit({
          type: 'setTransaction',
          txHash: this.$route.query.q
        })
        break
      case 'blkHash':
        this.subTitle = '块详情'
        this.$store.commit({
          type: 'setBlockHash',
          blockHash: this.$route.query.q
        })
        break
      case 'blhHeight':
        this.subTitle = '块详情'
        this.$store.commit({
          type: 'setBlockHeight',
          blockHeight: this.$route.query.q
        })
        break
      case 'address':
        this.subTitle = '账户详情'
        this.$store.commit({
          type: 'setAccountAddr',
          address: this.$route.query.q
        })
        break
    }
  },
  // mounted () {
  //   setTimeout(() => {
  //     window.location.reload(true)
  //   }, 1000)
  // },
  methods: {
    onTxClicked (txHash) {
      this.$router.push({path: `/eth-pchain/detail?type=txHash&q=${txHash}`})
      this.$store.commit({type: 'setTransaction', txHash})
    }
  }
}
</script>

<style>
.info-panel {
  width: 100%;
  padding: 10px 5px !important;
  position: absolute;
  top: 67px;
  bottom: 0;
  overflow-y: scroll;
}
</style>
