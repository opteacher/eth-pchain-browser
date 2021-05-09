<template>
  <layout actTab="trade">
    <a-tabs default-active-key="b2c" style="height: 100%; background-color: white">
      <a-tab-pane key="b2c" tab="基账户转账" style="padding: 15px 10px">
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="onTransToAddr">
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
              <a-select-option v-for="addr in $store.state.accounts.value" :key="addr" :value="addr">
                {{addr}}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="交易金额">
            <a-input
              v-decorator="['amount', { rules: [{ required: true, message: '必须输入金额!' }] }]"
              placeholder="输入交易金额"
              suffix="ETH"
              type="number"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button type="primary" html-type="submit">
              转账
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="c2c" tab="点对点转账" force-render>
        Content of Tab Pane 2
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
      form: this.$form.createForm(this, { name: 'trade' })
    }
  },
  methods: {
    onTransToAddr (e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)

          const value = '0x' + parseInt(values.amount).toString(16)
          const gas = await utils.reqChain('eth_estimateGas', [{
            from: this.$store.state.coinbase.value,
            to: values.toAddr,
            value
          }])
          const txHash = await utils.reqChain('eth_sendTransaction', [{
            from: this.$store.state.coinbase.value,
            to: values.toAddr,
            gas,
            value
          }])
          console.log(txHash)
        }
      })
    },
    async onMineClicked () {
      const mining = this.$store.state.mining.value
      await utils.reqChain(`miner_${mining ? 'stop' : 'start'}`)
      this.$store.commit('updMining')
    }
  }
}
</script>
