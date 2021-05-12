import Vue from 'vue'
import Vuex from 'vuex'
import utils from './utils'

Vue.use(Vuex)

function setState (key) {
  return function (state, payload) {
    state[key].value = payload[key]
  }
}

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
    gasLimit: {
      ctNum: 3600,
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
    selTx: {
      ctNum: 10,
      count: 0,
      value: {}
    },
    selBlock: {
      ctNum: 10,
      count: 0,
      value: {}
    },
    selAccount: {
      ctNum: 10,
      count: 0,
      value: {}
    }
  },
  mutations: {
    INCREMENT (state, payload) {
      state[payload.key].count++
    },
    CLEAR_COUNT (state, payload) {
      state[payload.key].count = 0
    },
    SET_CURRENT_VUE (state, payload) {
      state.curVue = payload.instance
    },
    TOGGLE_SYNC (state) {
      state.syncing.value = !state.syncing.value
      if (state.syncing.value) {
        state.syncing.handler = startJobs()
      } else if (state.syncing.handler) {
        clearInterval(state.syncing.handler)
        state.syncing.handler = null
      }
    },
    SET_BLOCK_ID: setState('blockId'),
    SET_BLOCK_NUMBER: setState('blockNumber'),
    SET_GAS_PRICE: setState('gasPrice'),
    SET_GAS_LIMIT: setState('gasLimit'),
    SET_BLOCKS: setState('blocks'),
    SET_MINING: setState('mining'),
    SET_PEER_COUNT: setState('peerCount'),
    SET_COINBASE: setState('coinbase'),
    SET_CB_BALANCE: setState('cbBalance'),
    SET_HASH_RATE: setState('hashrate'),
    SET_ACCOUNTS: setState('accounts'),
    SET_TXPOOL_CONTENT: setState('txpoolContent'),
    SET_SEL_TX: setState('selTx'),
    SET_SEL_BLOCK: setState('selBlock'),
    SET_SEL_ACCOUNT: setState('selAccount')
  },
  actions: {
    async updBlockId (context) {
      const result = await utils.reqChain('eth_chainId') || '0x0'
      context.commit('SET_BLOCK_ID', {
        blockId: utils.toNum(result, false)
      })
    },
    async updBlockNumber (context) {
      const result = await utils.reqChain('eth_blockNumber') || '0x0'
      context.commit('SET_BLOCK_NUMBER', {
        blockNumber: utils.toNum(result, false)
      })
    },
    async updGasPrice (context) {
      const result = await utils.reqChain('eth_gasPrice') || '0x0'
      context.commit('SET_GAS_PRICE', {
        gasPrice: utils.toNum(result, false)
      })
    },
    async updGasLimit (context) {
      const url = '/eth-pchain/api/v1/transaction/gasLimit'
      const result = await utils.reqBackend(url, 'get')
      context.commit('SET_GAS_LIMIT', result)
    },
    async updBlocks (context) {
      const blocks = []
      for (let i = this.state.blockNumber.value, j = 0; i > 0 && j <= 10; i--, j++) {
        const result = await utils.reqChain('eth_getBlockByNumber', [
          utils.toHex(i, false), false
        ])
        const dt = new Date(utils.toNum(result.timestamp, false))
        result.time = [
          dt.getHours().toString().padStart(2, '0'),
          dt.getMinutes().toString().padStart(2, '0'),
          dt.getSeconds().toString().padStart(2, '0')
        ].join(':')
        blocks.push(result)
      }
      context.commit('SET_BLOCKS', {blocks})
    },
    async updMining (context) {
      const result = await utils.reqChain('eth_mining')
      context.commit('SET_MINING', {
        mining: Boolean(result)
      })
    },
    async updPeerCount (context) {
      const result = await utils.reqChain('net_peerCount')
      context.commit('SET_PEER_COUNT', {
        peerCount: utils.toNum(result, false)
      })
    },
    async updCoinbase (context) {
      const coinbase = await utils.reqChain('eth_coinbase')
      context.commit('SET_COINBASE', {coinbase})
      const balance = await utils.reqChain('eth_getBalance', [
        coinbase, 'latest'
      ])
      context.commit('SET_CB_BALANCE', {
        cbBalance: utils.toNum(balance)
      })
    },
    async updHashrate (context) {
      const result = await utils.reqChain('eth_hashrate')
      context.commit('SET_HASH_RATE', {
        hashrate: utils.toNum(result, false)
      })
    },
    async updAccounts (context) {
      const result = await utils.reqChain('eth_accounts')
      const accounts = []
      for (let address of result) {
        const balance = await utils.reqChain('eth_getBalance', [
          address, 'latest'
        ])
        accounts.push({
          address, balance: utils.toNum(balance)
        })
      }
      context.commit('SET_ACCOUNTS', {accounts})
    },
    async updTxpoolContent (context) {
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
              index, nvalue: utils.toNum(tx.value)
            }))
          }
        }
        return result
      }
      const pending = pcsRes(result.pending)
      const queued = pcsRes(result.queued)
      context.commit('SET_TXPOOL_CONTENT', {
        txpoolContent: {pending, queued}
      })
    },
    async updSelTx (context, payload) {
      let txHash = ''
      if (payload && payload.txHash) {
        txHash = payload.txHash
      } else if (this.state.selTx.value.hash) {
        txHash = this.state.selTx.value.hash
      } else {
        return
      }
      if (payload && payload.clearOthers) {
        this.state.selBlock.value = {}
        this.state.selAccount.value = {}
      }
      const selTx = await utils.reqChain('eth_getTransactionByHash', [txHash])
      selTx.nvalue = utils.toNum(selTx.value)
      selTx.ngas = utils.toNum(selTx.gas, false)
      selTx.nblockNumber = utils.toNum(selTx.blockNumber, false)
      const txReceipt = await utils.reqChain('eth_getTransactionReceipt', [txHash])
      if (txReceipt.contractAddress) {
        selTx.contractAddress = txReceipt.contractAddress
      }
      context.commit('SET_SEL_TX', {selTx})
    },
    async updSelBlock (context, payload) {
      let selBlock = {}
      if (payload) {
        if (payload.blkHash) {
          selBlock = await utils.reqChain('eth_getBlockByHash', [
            payload.blkHash, true
          ])
        } else if (payload.blkNumber) {
          selBlock = await utils.reqChain('eth_getBlockByNumber', [
            payload.blkNumber, true
          ])
        }
      } else if (this.state.selBlock.value.hash) {
        selBlock = await utils.reqChain('eth_getBlockByHash', [
          this.state.selBlock.value.hash, true
        ])
      } else {
        return
      }
      if (payload && payload.clearOthers) {
        this.state.selTx.value = {}
        this.state.selAccount.value = {}
      }
      selBlock.nnumber = utils.toNum(selBlock.number, false)
      selBlock.ndifficulty = utils.toNum(selBlock.difficulty, false)
      selBlock.nsize = utils.toNum(selBlock.size, false)
      selBlock.ngasUsed = utils.toNum(selBlock.gasUsed, false)
      const dt = new Date(utils.toNum(selBlock.timestamp, false))
      selBlock.time = [
        dt.getHours().toString().padStart(2, '0'),
        dt.getMinutes().toString().padStart(2, '0'),
        dt.getSeconds().toString().padStart(2, '0')
      ].join(':')
      context.commit('SET_SEL_BLOCK', {selBlock})
    },
    async updSelAccount (context, payload) {
      let address = ''
      if (payload && payload.address) {
        address = payload.address
      } else if (this.state.selAccount.value.address) {
        address = this.state.selAccount.value.address
      } else {
        return
      }
      if (payload && payload.clearOthers) {
        this.state.selTx.value = {}
        this.state.selBlock.value = {}
      }
      const result = await utils.reqChain('eth_getBalance', [address, 'latest'])
      context.commit('SET_SEL_ACCOUNT', {
        selAccount: {
          address, nbalance: utils.toNum(result)
        }
      })
    }
  }
})

function refresh (sttNam, updFun, cmtImd) {
  if (cmtImd) {
    store.dispatch(updFun)
    return
  }
  const state = store.state[sttNam]
  if (state.count === state.ctNum) {
    store.commit('CLEAR_COUNT', {key: sttNam})
    store.dispatch(updFun)
  }
  store.commit('INCREMENT', {key: sttNam})
}

function refreshAll (cmtImd = false) {
  refresh('blockId', 'updBlockId', cmtImd)
  refresh('blockNumber', 'updBlockNumber', cmtImd)
  refresh('gasPrice', 'updGasPrice', cmtImd)
  refresh('gasLimit', 'updGasLimit', cmtImd)
  setTimeout(() => {
    refresh('blocks', 'updBlocks', cmtImd)
  }, 1000)
  refresh('mining', 'updMining', cmtImd)
  refresh('peerCount', 'updPeerCount', cmtImd)
  refresh('coinbase', 'updCoinbase', cmtImd)
  refresh('hashrate', 'updHashrate', cmtImd)
  refresh('accounts', 'updAccounts', cmtImd)
  refresh('txpoolContent', 'updTxpoolContent', cmtImd)
  refresh('selTx', 'updSelTx', cmtImd)
  refresh('selBlock', 'updSelBlock', cmtImd)
  refresh('selAccount', 'updSelAccount', cmtImd)
}

function startJobs () {
  refreshAll(true)
  return setInterval(refreshAll, 1000)
}

export default {
  store, startJobs
}
