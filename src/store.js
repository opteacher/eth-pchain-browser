import Vue from 'vue'
import Vuex from 'vuex'
import utils from './utils'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    blockId: {
      ctNum: 60,
      count: 0,
      value: -1
    },
    blockNumber: {
      ctNum: 1,
      count: 0,
      value: 0
    },
    gasPrice: {
      ctNum: 60,
      count: 0,
      value: 0
    },
    blocks: {
      ctNum: 2,
      count: 0,
      value: []
    },
    mining: {
      ctNum: 5,
      count: 0,
      value: false
    },
    peerCount: {
      ctNum: 60,
      count: 0,
      value: 0
    },
    coinbase: {
      ctNum: 5,
      count: 0,
      value: ''
    },
    cbBalance: {
      value: 0
    },
    hashrate: {
      ctNum: 20,
      count: 0,
      value: 0
    },
    accounts: {
      ctNum: 10,
      count: 0,
      value: []
    },
    txpoolContent: {
      ctNum: 3,
      count: 0,
      value: {
        pending: {},
        queued: {}
      }
    }
  },
  mutations: {
    async updBlockId (state) {
      const sres = await utils.reqChain('eth_chainId') || '0x0'
      state.blockId.value = utils.toWei(sres, false)
    },
    async updBlockNumber (state) {
      const sres = await utils.reqChain('eth_blockNumber') || '0x0'
      state.blockNumber.value = utils.toWei(sres, false)
    },
    async updGasPrice (state) {
      const sres = await utils.reqChain('eth_gasPrice') || '0x0'
      state.gasPrice.value = utils.toWei(sres, false)
    },
    async updBlocks (state) {
      state.blocks.value = []
      for (let i = state.blockNumber.value, j = 0; i > 0 && j <= 10; i--, j++) {
        const sres = await utils.reqChain('eth_getBlockByNumber', [
          utils.fromWei(i, false), false
        ])
        const dt = new Date(utils.toWei(sres.timestamp, false))
        sres.time = [
          dt.getHours().toString().padStart(2, '0'),
          dt.getMinutes().toString().padStart(2, '0'),
          dt.getSeconds().toString().padStart(2, '0')
        ].join(':')
        state.blocks.value.push(sres)
      }
    },
    async updMining (state) {
      const sres = await utils.reqChain('eth_mining')
      state.mining.value = Boolean(sres)
    },
    async updPeerCount (state) {
      const sres = await utils.reqChain('net_peerCount')
      state.peerCount.value = utils.toWei(sres, false)
    },
    async updCoinbase (state) {
      let sres = await utils.reqChain('eth_coinbase')
      state.coinbase.value = sres
      sres = await utils.reqChain('eth_getBalance', [
        state.coinbase.value, 'latest'
      ])
      state.cbBalance.value = utils.toWei(sres)
    },
    async updHashrate (state) {
      const sres = await utils.reqChain('eth_hashrate')
      state.hashrate.value = utils.toWei(sres, false)
    },
    async updAccounts (state) {
      const sres = await utils.reqChain('eth_accounts')
      state.accounts.value = []
      for (let address of sres) {
        const sbalance = await utils.reqChain('eth_getBalance', [
          address, 'latest'
        ])
        state.accounts.value.push({
          address, balance: utils.toWei(sbalance)
        })
      }
    },
    async updTxpoolContent (state) {
      const sres = await utils.reqChain('txpool_content')
      let pending = []
      for (let [index, tx] of Object.entries(Object.values(sres.pending))) {
        pending = pending.concat(Object.assign(tx[index], {index}))
      }
      let queued = []
      for (let [index, tx] of Object.entries(Object.values(sres.queued))) {
        queued = queued.concat(Object.assign(tx[index], {index}))
      }
      state.txpoolContent.value = {pending, queued}
    }
  }
})

function commitByConds (sttNam, updFun, cmtImd) {
  if (cmtImd) {
    store.commit(updFun)
    return
  }
  const state = store.state[sttNam]
  if (state.count === state.ctNum) {
    state.count = 0
    store.commit(updFun)
  }
  state.count++
}

function commitAll (cmdImd = false) {
  commitByConds('blockId', 'updBlockId', cmdImd)
  commitByConds('blockNumber', 'updBlockNumber', cmdImd)
  commitByConds('gasPrice', 'updGasPrice', cmdImd)
  setTimeout(() => {
    commitByConds('blocks', 'updBlocks', cmdImd)
  }, 1000)
  commitByConds('mining', 'updMining', cmdImd)
  commitByConds('peerCount', 'updPeerCount', cmdImd)
  commitByConds('coinbase', 'updCoinbase', cmdImd)
  commitByConds('hashrate', 'updHashrate', cmdImd)
  commitByConds('accounts', 'updAccounts', cmdImd)
  commitByConds('txpoolContent', 'updTxpoolContent', cmdImd)
}

export default {
  store,
  startJobs () {
    commitAll(true)
    return setInterval(commitAll, 1000)
  }
}
