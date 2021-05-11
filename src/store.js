import Vue from 'vue'
import Vuex from 'vuex'
import utils from './utils'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    curVue: null,
    syncing: {
      handler: null,
      value: false
    },
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
      ctNum: 5,
      count: 0,
      value: []
    },
    mining: {
      ctNum: 10,
      count: 0,
      value: false
    },
    peerCount: {
      ctNum: 60,
      count: 0,
      value: 0
    },
    coinbase: {
      ctNum: 10,
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
      ctNum: 5,
      count: 0,
      value: {
        pending: [],
        queued: []
      }
    },
    selection: {
      ctNum: 5,
      count: 0,
      value: {}
    }
  },
  mutations: {
    setCurrentVue (state, payload) {
      state.curVue = payload.instance
    },
    toggleSync (state) {
      state.syncing.value = !state.syncing.value
      if (state.syncing.value) {
        state.syncing.handler = startJobs()
      } else if (state.syncing.handler) {
        clearInterval(state.syncing.handler)
        state.syncing.handler = null
      }
    },
    async updBlockId (state) {
      const result = await utils.reqChain('eth_chainId') || '0x0'
      state.blockId.value = utils.toWei(result, false)
    },
    async updBlockNumber (state) {
      const result = await utils.reqChain('eth_blockNumber') || '0x0'
      state.blockNumber.value = utils.toWei(result, false)
    },
    async updGasPrice (state) {
      const result = await utils.reqChain('eth_gasPrice') || '0x0'
      state.gasPrice.value = utils.toWei(result, false)
    },
    async updBlocks (state) {
      state.blocks.value = []
      for (let i = state.blockNumber.value, j = 0; i > 0 && j <= 10; i--, j++) {
        const result = await utils.reqChain('eth_getBlockByNumber', [
          utils.fromWei(i, false), false
        ])
        const dt = new Date(utils.toWei(result.timestamp, false))
        result.time = [
          dt.getHours().toString().padStart(2, '0'),
          dt.getMinutes().toString().padStart(2, '0'),
          dt.getSeconds().toString().padStart(2, '0')
        ].join(':')
        state.blocks.value.push(result)
      }
    },
    async updMining (state) {
      const result = await utils.reqChain('eth_mining')
      state.mining.value = Boolean(result)
    },
    async updPeerCount (state) {
      const result = await utils.reqChain('net_peerCount')
      state.peerCount.value = utils.toWei(result, false)
    },
    async updCoinbase (state) {
      let result = await utils.reqChain('eth_coinbase')
      state.coinbase.value = result
      result = await utils.reqChain('eth_getBalance', [
        state.coinbase.value, 'latest'
      ])
      state.cbBalance.value = utils.toWei(result)
    },
    async updHashrate (state) {
      const result = await utils.reqChain('eth_hashrate')
      state.hashrate.value = utils.toWei(result, false)
    },
    async updAccounts (state) {
      const result = await utils.reqChain('eth_accounts')
      state.accounts.value = []
      for (let address of result) {
        const sbalance = await utils.reqChain('eth_getBalance', [
          address, 'latest'
        ])
        state.accounts.value.push({
          address, balance: utils.toWei(sbalance)
        })
      }
    },
    async updTxpoolContent (state) {
      const result = await utils.reqChain('txpool_content')
      const pcsRes = data => {
        let array = Object.values(data)
        if (!(array instanceof Array)) {
          array = [array]
        }
        let result = []
        for (const item of array) {
          for (const [index, tx] of Object.entries(item)) {
            result = result.concat(Object.assign(tx, {
              index,
              weiVal: utils.toWei(tx.value)
            }))
          }
        }
        return result
      }
      const pending = pcsRes(result.pending)
      const queued = pcsRes(result.queued)
      state.txpoolContent.value = {pending, queued}
    },
    setTransaction (state, payload) {
      state.selection.value = {
        hash: payload.txHash
      }
      this.commit('updSelection')
    },
    setBlockHash (state, payload) {
      state.selection.value = {
        hash: payload.blockHash,
        number: ''
      }
      this.commit('updSelection')
    },
    setBlockHeight (state, payload) {
      state.selection.value = {
        hash: '',
        number: payload.blockHeight
      }
      this.commit('updSelection')
    },
    setAccountAddr (state, payload) {
      state.selection.value = {
        address: payload.address
      }
      this.commit('updSelection')
    },
    async updSelection (state) {
      if (state.selection.value.hash && state.selection.value.number === undefined) {
        state.selection.value = await utils.reqChain('eth_getTransactionByHash', [
          state.selection.value.hash
        ])
        state.selection.value.wvalue = utils.toWei(state.selection.value.value)
        state.selection.value.wgas = utils.toWei(state.selection.value.gas, false)
        state.selection.value.wblockNumber = utils.toWei(state.selection.value.blockNumber, false)
      }
      if (state.selection.value.hash && state.selection.value.number === '') {
        state.selection.value = await utils.reqChain('eth_getBlockByHash', [
          state.selection.value.hash, true
        ])
      } else if (state.selection.value.number && state.selection.value.hash === '') {
        state.selection.value = await utils.reqChain('eth_getBlockByNumber', [
          state.selection.value.number, true
        ])
      }
      if (state.selection.value.hash || state.selection.value.number) {
        state.selection.value.wnumber = utils.toWei(state.selection.value.number, false)
        state.selection.value.wdifficulty = utils.toWei(state.selection.value.difficulty, false)
        state.selection.value.wsize = utils.toWei(state.selection.value.size, false)
        state.selection.value.wgasUsed = utils.toWei(state.selection.value.gasUsed, false)
        const dt = new Date(utils.toWei(state.selection.value.timestamp, false))
        state.selection.value.time = [
          dt.getHours().toString().padStart(2, '0'),
          dt.getMinutes().toString().padStart(2, '0'),
          dt.getSeconds().toString().padStart(2, '0')
        ].join(':')
      }
      if (state.selection.value.address) {
        const result = await utils.reqChain('eth_getBalance', [
          state.selection.value.address, 'latest'
        ])
        state.selection.value.wbalance = utils.toWei(result)
      }
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
  commitByConds('selection', 'updSelection', cmdImd)
}

function startJobs () {
  commitAll(true)
  return setInterval(commitAll, 1000)
}

export default {
  store, startJobs
}
