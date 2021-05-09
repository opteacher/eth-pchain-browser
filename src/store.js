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
    }
  },
  mutations: {
    async updBlockId (state) {
      const sres = await utils.reqChain('eth_chainId') || '0x0'
      state.blockId.value = parseInt(sres, 16)
    },
    async updBlockNumber (state) {
      const sres = await utils.reqChain('eth_blockNumber') || '0x0'
      state.blockNumber.value = parseInt(sres, 16)
    },
    async updGasPrice (state) {
      const sres = await utils.reqChain('eth_gasPrice') || '0x0'
      state.gasPrice.value = parseInt(sres, 16)
    },
    async updBlocks (state) {
      state.blocks.value = []
      for (let i = state.blockNumber.value, j = 0; i > 0 && j <= 10; i--, j++) {
        const sres = await utils.reqChain('eth_getBlockByNumber', ['0x' + i.toString(16), false])
        const dt = new Date(parseInt(sres.timestamp, 16))
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
      state.peerCount.value = parseInt(sres, 16)
    },
    async updCoinbase (state) {
      let sres = await utils.reqChain('eth_coinbase')
      state.coinbase.value = sres
      sres = await utils.reqChain('eth_getBalance', [
        state.coinbase.value, 'latest'
      ])
      state.cbBalance.value = parseInt(sres, 16)
    },
    async updHashrate (state) {
      const sres = await utils.reqChain('eth_hashrate')
      state.hashrate.value = parseInt(sres, 16)
    },
    async updAccounts (state) {
      const sres = await utils.reqChain('eth_accounts')
      state.accounts.value = sres
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
}

export default {
  store,
  startJobs () {
    commitAll(true)
    return setInterval(commitAll, 1000)
  }
}
