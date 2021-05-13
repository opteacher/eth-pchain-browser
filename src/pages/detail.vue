<template>
  <div>
    <header-dtl title="交易详情"/>
    <div class="info-panel">
      <a-descriptions v-if="$route.query.type === 'txHash'" title="交易信息" bordered size="small">
        <a-descriptions-item label="交易哈希">
          <lg-hash :hash="$route.query.q" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item v-if="$store.state.selTx.value.contractName" label="合约名">
          {{$store.state.selTx.value.contractName}}
        </a-descriptions-item>
        <a-descriptions-item v-if="$store.state.selTx.value.contractAddress" label="合约地址">
          <lg-hash :hash="$store.state.selTx.value.contractAddress || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="发送方">
          <lg-hash :hash="$store.state.selTx.value.from || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="接收方">
          <lg-hash :hash="$store.state.selTx.value.to || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="金额">
          {{$store.state.selTx.value.nvalue || 0}}&nbsp;{{$store.state.selTx.value.unit || 'ETH'}}
        </a-descriptions-item>
        <a-descriptions-item label="gas费">
          {{$store.state.selTx.value.ngas || 0}}&nbsp;Satoshi
        </a-descriptions-item>
        <a-descriptions-item label="块高">
          {{$store.state.selTx.value.nblockNumber || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="块哈希">
          <lg-hash :hash="$store.state.selTx.value.blockHash || 'pending'" :width="55"/>
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions v-if="$route.query.type === 'blkHash' || $route.query.type === 'blhHeight'"
        class="mb-5" title="块信息" bordered size="small"
      >
        <a-descriptions-item label="块哈希">
          <lg-hash :hash="$store.state.selBlock.value.hash || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="块高">
          {{$store.state.selBlock.value.nnumber || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="父块哈希">
          <lg-hash :hash="$store.state.selBlock.value.parentHash || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="pow哈希">
          <lg-hash :hash="$store.state.selBlock.value.nonce || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="矿工地址">
          <lg-hash :hash="$store.state.selBlock.value.miner || 'pending'" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="难度">
          {{$store.state.selBlock.value.ndifficulty || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="大小">
          {{$store.state.selBlock.value.nsize || 0}}&nbsp;byte
        </a-descriptions-item>
        <a-descriptions-item label="总gas费">
          {{$store.state.selBlock.value.ngasUsed || 0}}
        </a-descriptions-item>
        <a-descriptions-item label="生成时间">
          {{$store.state.selBlock.value.time || '00:00:00'}}
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions
        v-if="$route.query.type === 'blkHash' || $route.query.type === 'blhHeight'"
        layout="vertical" bordered size="small"
      >
        <a-descriptions-item label="块中交易">
          <div class="tx-list">
            <a-list size="small" item-layout="horizontal"
              :data-source="$store.state.selBlock.value.transactions || []"
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
      <a-descriptions v-if="$route.query.type === 'address'"
        class="mb-5" title="账户信息" bordered size="small"
      >
        <a-descriptions-item label="地址">
          <lg-hash :hash="$route.query.q" :width="60"/>
        </a-descriptions-item>
        <a-descriptions-item label="余额">
          {{$store.state.selAccount.value.nbalance || 0}}&nbsp;ETH
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script>
import lgHash from '../common/lgHash'
import header from '../common/header'
export default {
  name: 'detail',
  inject: ['reload'],
  components: {
    'lg-hash': lgHash,
    'header-dtl': header
  },
  data () {
    return {
      subTitle: ''
    }
  },
  created () {
    this.$store.commit('SET_CURRENT_VUE', {
      instance: this
    })

    switch (this.$route.query.type) {
      case 'txHash':
        this.subTitle = '交易详情'
        this.$store.dispatch('updSelTx', {
          txHash: this.$route.query.q,
          clearOthers: true
        })
        break
      case 'blkHash':
        this.subTitle = '块详情'
        this.$store.dispatch('updSelBlock', {
          blkHash: this.$route.query.q,
          clearOthers: true
        })
        break
      case 'blhHeight':
        this.subTitle = '块详情'
        this.$store.dispatch('updSelBlock', {
          blkNumber: this.$route.query.q,
          clearOthers: true
        })
        break
      case 'address':
        this.subTitle = '账户详情'
        this.$store.dispatch('updSelAccount', {
          address: this.$route.query.q,
          clearOthers: true
        })
        break
    }
  },
  methods: {
    onTxClicked (txHash) {
      this.$router.push({path: `/eth-pchain/detail?type=txHash&q=${txHash}`})
      this.$store.dispatch('updSelTx', {txHash})
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
