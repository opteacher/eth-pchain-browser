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
        <a-descriptions-item label="基账户地址">
          <div class="ant-list-item" style="padding: 0">
            <div style="width: 60vw">
              <p class="no-br">{{$store.state.coinbase.value}}</p>
            </div>
            <a-button type="link"><a-icon type="copy"/></a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item>
          <div slot="label">
            <p class="mb-5">所有地址</p>
            <a-button type="primary" size="small" @click="genAcc.shwDlg = true">
              生成地址
            </a-button>
            <a-modal v-model="genAcc.shwDlg" title="生成地址" @ok="onGenAccount">
              <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
                <a-form-item label="账户密码"
                  :has-feedback="genAcc.passwdErr"
                  :validate-status="genAcc.passwdErr ? 'error' : ''"
                  :help="genAcc.passwdErr ? '账户密码不能为空' : ''">
                  <a-input v-model="genAcc.passwd" placeholder="输入账户密码"/>
                </a-form-item>
              </a-form>
            </a-modal>
          </div>
          <a-list item-layout="horizontal" :data-source="$store.state.accounts.value">
            <a-list-item slot="renderItem" slot-scope="item, index">
              <div style="width: 60vw">
                <p class="no-br">{{item}}</p>
              </div>
              <a-button type="link"><a-icon type="copy"/></a-button>
            </a-list-item>
          </a-list>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card class="mb-5" title="块信息">
      <a-input-search class="mb-10" placeholder="输入块哈希或块高" @search="onSearch">
        <a-button slot="enterButton" type="primary" :loading="block.searching">
          <a-icon type="search"/>
        </a-button>
      </a-input-search>
      <div style="height: 30vh; overflow-y: scroll">
        <a-list size="small" item-layout="horizontal" :data-source="$store.state.blocks.value">
          <a slot="renderItem" slot-scope="item, index" @click="onBlockClicked(item)">
            <a-list-item>
              <a-list-item-meta>
                <div slot="description" style="width: 60vw">
                  <p class="no-br">{{item.hash}}</p>
                </div>
              </a-list-item-meta>
              <div style="text-align: right">{{item.time}}</div>
            </a-list-item>
          </a>
        </a-list>
      </div>
    </a-card>
  </layout>
</template>

<script>
import layout from '../common/layout.vue'
import utils from '../utils'
export default {
  components: {
    layout
  },
  data () {
    return {
      block: {
        select: null,
        searching: false
      },
      genAcc: {
        shwDlg: false,
        passwd: '',
        passwdErr: false
      }
    }
  },
  created () {

  },
  methods: {
    async onMineChanged (argus) {
      await utils.reqChain(`miner_${argus ? 'start' : 'stop'}`)
    },
    async onSearch (argus) {
      this.block.searching = true
      const blockId = parseInt(argus)
      let block = null
      if (isNaN(blockId)) {
        block = await utils.reqChain('eth_getBlockByHash', [blockId, true])
      } else {
        block = await utils.reqChain('eth_getBlockByNumber', [
          '0x' + blockId.toString(16), true
        ])
      }
      console.log(block)
      this.block.searching = false
    },
    onBlockClicked (block) {
      console.log(block)
    },
    async onGenAccount () {
      if (!this.genAcc.passwd) {
        this.genAcc.passwdErr = true
        return
      }
      const newAddr = await utils.reqChain('personal_newAccount', [
        this.genAcc.passwd
      ])
      if (!newAddr) {
        this.$message.error('生成地址失败！')
      } else {
        this.$message.success(`生成地址成功！${newAddr}`)
      }
      this.genAcc.passwdErr = false
    }
  }
}
</script>

<style>
.chain-info .ant-card-body {
  padding: 15px 10px !important;
}
</style>
