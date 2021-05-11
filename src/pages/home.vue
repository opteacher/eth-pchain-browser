<template>
  <layout actTab="home">
    <a-card class="chain-info mb-5" :title="`区块链信息（ID${$store.state.blockId.value}）`">
      <a-descriptions bordered size="small"
        :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }"
      >
        <a-descriptions-item>
          <div slot="label">
            <p class="mb-5">块高</p>
            <a-switch checked-children="挖矿中" un-checked-children="停止中"
              v-model="$store.state.mining.value" @change="onMineChanged"
            />
          </div>
          <p class="mb-0">{{$store.state.blockNumber.value}}</p>
        </a-descriptions-item>
        <a-descriptions-item label="Gas费">
          {{$store.state.gasPrice.value}}
        </a-descriptions-item>
        <a-descriptions-item label="节点数量">
          {{$store.state.peerCount.value}}
        </a-descriptions-item>
        <a-descriptions-item label="算力">
          {{$store.state.hashrate.value}}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card class="mb-5" title="账户">
      <a-input-group class="mb-5" compact>
        <a-input style="width: 60%" v-model="genAcc.search" placeholder="输入账户地址"/>
        <a-button style="width: 20%" type="primary" @click="onSearchAccount">
          <a-icon type="search"/>
        </a-button>
        <a-button style="width: 20%" type="primary" @click="genAcc.shwDlg = true">
          <a-icon type="plus"/>
        </a-button>
      </a-input-group>
      <a-modal v-model="genAcc.shwDlg" title="生成地址" @ok="onGenAccount" :confirmLoading="genAcc.loading">
        <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-form-item label="账户密码"
            :has-feedback="genAcc.passwdErr"
            :validate-status="genAcc.passwdErr ? 'error' : ''"
            :help="genAcc.passwdErr ? '账户密码不能为空' : ''">
            <a-input v-model="genAcc.passwd" placeholder="输入新账户密码"/>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-descriptions layout="vertical" size="small" bordered>
        <a-descriptions-item label="基账户">
          <lg-hash :hash="$store.state.coinbase.value" :width="85"/>
        </a-descriptions-item>
        <a-descriptions-item label="所有账户" style="text-align: left">
          <div class="tx-list" style="height: 30vh">
            <a-list item-layout="horizontal" :data-source="$store.state.accounts.value">
              <a-list-item slot="renderItem" slot-scope="item, index">
                <lg-hash :hash="item.address" :width="70"/>
                <span style="width: 10vw; overflow-x: scroll">{{item.balance}}</span>
              </a-list-item>
            </a-list>
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card class="mb-5" title="块信息">
      <a-input-search class="mb-10" placeholder="输入块哈希或块高" @search="onSearchBlock">
        <a-button slot="enterButton" type="primary">
          <a-icon type="search"/>
        </a-button>
      </a-input-search>
      <div style="height: 30vh; overflow-y: scroll">
        <a-list size="small" item-layout="horizontal" :data-source="$store.state.blocks.value">
          <a slot="renderItem" slot-scope="block, index"
            @click="$router.push({path: `/eth-pchain/detail?type=blkHash&q=${block.hash}`})"
          >
            <a-list-item>
              <a-list-item-meta>
                <div slot="description" style="width: 70vw">
                  <p class="no-br">{{block.hash}}</p>
                </div>
              </a-list-item-meta>
              <div style="text-align: right">{{block.time}}</div>
            </a-list-item>
          </a>
        </a-list>
      </div>
    </a-card>

    <a-card title="交易池">
      <a-input-search class="mb-10" placeholder="输入交易哈希" @search="onSearchTx">
        <a-button slot="enterButton" type="primary">
          <a-icon type="search"/>
        </a-button>
      </a-input-search>
      <a-descriptions layout="vertical" size="small" bordered>
        <a-descriptions-item label="等待中交易">
          <div class="tx-list">
            <a-list size="small" item-layout="horizontal"
              :data-source="$store.state.txpoolContent.value.pending"
            >
              <lg-hash slot="renderItem" slot-scope="item, index" :hash="item.hash" :width="85"/>
            </a-list>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="排队中交易">
          <div class="tx-list">
            <a-list size="small" item-layout="horizontal"
              :data-source="$store.state.txpoolContent.value.queued"
            >
              <lg-hash slot="renderItem" slot-scope="item, index" :hash="item.hash" :width="85"/>
            </a-list>
          </div>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </layout>
</template>

<script>
import layout from '../common/layout.vue'
import lgHash from '../common/lgHash.vue'
import utils from '../utils'
export default {
  components: {
    layout,
    'lg-hash': lgHash
  },
  data () {
    return {
      genAcc: {
        search: '',
        shwDlg: false,
        passwd: '',
        passwdErr: false,
        loading: false
      }
    }
  },
  created () {
    this.$store.commit({
      type: 'setCurrentVue',
      instance: this
    })
  },
  methods: {
    async onMineChanged (argus) {
      await utils.reqChain(`miner_${argus ? 'start' : 'stop'}`)
    },
    onSearchBlock (argus) {
      const blkHeight = parseInt(argus)
      if (isNaN(blkHeight)) {
        this.$router.push({path: `/eth-pchain/detail?type=blkHash&q=${argus}`})
      } else {
        this.$router.push({path: `/eth-pchain/detail?type=blhHeight&q=${utils.fromWei(blkHeight, false)}`})
      }
    },
    onSearchTx (argus) {
      this.$router.push({path: `/eth-pchain/detail?type=txHash&q=${argus}`})
    },
    onTxClicked (tx) {
      this.$router.push({path: `/eth-pchain/detail?type=txHash&q=${tx.hash}`})
    },
    onSearchAccount () {
      this.$router.push({path: `/eth-pchain/detail?type=address&q=${this.genAcc.search}`})
    },
    async onGenAccount () {
      if (!this.genAcc.passwd) {
        this.genAcc.passwdErr = true
        return
      }
      this.genAcc.loading = true
      const newAddr = await utils.reqChain('personal_newAccount', [
        this.genAcc.passwd
      ])
      this.genAcc.loading = false
      this.genAcc.shwDlg = false
      if (!newAddr) {
        this.$message.error('生成地址失败！')
      } else {
        this.$message.success(`生成地址成功！${newAddr}`)
      }
    }
  }
}
</script>

<style>
.ant-card-body {
  padding: 15px 10px !important;
}

.tx-list {
  width: 100%;
  height: 15vh;
  overflow-y: scroll
}

.ant-descriptions-item-content {
  width: 100%;
  padding: 0 10px !important;
}
</style>
