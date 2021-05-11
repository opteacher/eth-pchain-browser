<template>
  <layout actTab="trade">
    <a-tabs default-active-key="b2c" style="height: 100%; background-color: white">
      <a-tab-pane key="b2c" tab="基账户转账" style="padding: 15px 10px">
        <a-form :form="to.form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="onTransToSubmit">
          <a-form-item label="基账户余额">
            <a-input-search
              :value="$store.state.cbBalance.value"
              suffix="ETH"
              type="number"
              disabled
            >
              <a-button slot="enterButton" :type="$store.state.mining.value ? 'primary' : 'default'"
                @click.native="onMineClicked"
              >
                {{$store.state.mining.value ? "挖矿中" : "挖矿停止"}}
              </a-button>
            </a-input-search>
          </a-form-item>
          <a-form-item label="目标地址">
            <a-select
              v-decorator="[
                'toAddr', { rules: [{ required: true, message: '必须选择转账地址！' }] },
              ]"
              placeholder="选择转账目标地址"
            >
              <a-select-option
                v-for="account in $store.state.accounts.value"
                :key="account.address" :value="account.address"
              >
                {{account.address}}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="交易金额">
            <a-input
              v-decorator="['amountTo', { rules: [{ required: true, message: '必须输入金额!' }] }]"
              placeholder="输入交易金额"
              suffix="ETH"
              type="number"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button type="primary" html-type="submit" :loading="to.loading">
              转账
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="c2c" tab="点对点转账" force-render style="padding: 15px 10px">
        <a-form :form="from.form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="onTransFromSubmit">
          <a-form-item label="源地址">
            <a-select
              v-decorator="[
                'fromAddr', { rules: [{ required: true, message: '必须选择转账地址！' }] },
              ]"
              placeholder="选择转账源地址"
              @change="onFromAddrChanged"
            >
              <a-select-option
                v-for="account in $store.state.accounts.value"
                :key="account.address" :value="account.address"
              >
                {{account.address}}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="源账户密码">
            <a-input-password placeholder="输入源账户密码"
              v-decorator="['passwd', { rules: [{ required: true, message: '必须输入源账户密码！' }] }]"
            />
          </a-form-item>
          <a-form-item label="目标地址">
            <a-select
              v-decorator="[
                'toAddr', { rules: [{ required: true, message: '必须选择转账地址！' }] },
              ]"
              placeholder="选择转账目标地址"
            >
              <a-select-option
                v-for="account in $store.state.accounts.value"
                :key="account.address" :value="account.address"
              >
                {{account.address}}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="`交易金额${from.balance !== -1 ? '（可用余额：' + from.balance + '）' : ''}`">
            <a-input-search
              v-decorator="['amountFrom', { rules: [{ required: true, message: '必须输入金额!' }] }]"
              placeholder="输入交易金额"
              suffix="ETH"
              type="number"
            >
              <a-button slot="enterButton" @click.native="onAllBalanceClicked">
                全部余额
              </a-button>
            </a-input-search>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button type="primary" html-type="submit" :loading="from.loading">
              转账
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
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
      to: {
        form: this.$form.createForm(this, { name: 'tradeTo' }),
        loading: false
      },
      from: {
        form: this.$form.createForm(this, { name: 'tradeFrom' }),
        balance: -1,
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
    async _transfer (from, to, amount, passwd = '') {
      const value = utils.fromWei(amount)
      if (from !== this.$store.state.coinbase.value) {
        const unlocked = await utils.reqChain('personal_unlockAccount', [
          from, passwd
        ])
        if (!unlocked) {
          return Promise.resolve('')
        }
      }
      const gas = await utils.reqChain('eth_estimateGas', [{
        from, to, value
      }])
      const txHash = await utils.reqChain('eth_sendTransaction', [{
        from, to, gas, value
      }])
      return Promise.resolve(txHash)
    },
    onTransToSubmit (e) {
      e.preventDefault()
      this.to.form.validateFields(async (err, values) => {
        if (err) {
          return
        }
        this.to.loading = true
        const txHash = await this._transfer(
          this.$store.state.coinbase.value,
          values.toAddr, values.amountTo
        )
        this.to.loading = false
        this.$router.push({
          path: `/eth-pchain/result?txHash=${txHash}`
        })
      })
    },
    onTransFromSubmit (e) {
      e.preventDefault()
      this.from.form.validateFields(async (err, values) => {
        if (err) {
          return
        }
        this.from.loading = true
        const txHash = await this._transfer(
          values.fromAddr, values.toAddr,
          values.amountFrom, values.passwd
        )
        this.from.loading = false
        this.$router.push({
          path: `/eth-pchain/result?txHash=${txHash}`
        })
      })
    },
    async onMineClicked () {
      const mining = this.$store.state.mining.value
      await utils.reqChain(`miner_${mining ? 'stop' : 'start'}`)
      this.$store.commit('updMining')
    },
    onFromAddrChanged (argus) {
      for (let acc of this.$store.state.accounts.value) {
        if (argus === acc.address) {
          this.from.balance = acc.balance
          break
        }
      }
    },
    onAllBalanceClicked () {
      this.from.form.setFieldsValue({amountFrom: this.from.balance})
    }
  }
}
</script>
