<template>
  <div>
    <header-dtl title="合约接口"/>
    <div class="contract-panel">
      <a-form :form="callForm" @submit="onCallMethodSubmit">
        <a-form-item label="智能合约信息">
          <a-descriptions size="small" bordered>
            <a-descriptions-item label="合约名">
              {{$route.query.ctrtName}}
            </a-descriptions-item>
            <a-descriptions-item label="合约地址">
              <lg-hash :hash="$route.query.ctrtAddr" :width="50"/>
            </a-descriptions-item>
            <a-descriptions-item label="接口名">
              {{$route.query.method}}
            </a-descriptions-item>
          </a-descriptions>
        </a-form-item>
        <a-form-item
          v-for="param in params"
          :key="param.name"
          :label="param.name"
          :required="false"
        >
          <a-input
            :placeholder="`输入参数值，类型（${param.type}）`"
            v-decorator="[`params[${param.name}]`]"
            block
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block>调用</a-button>
        </a-form-item>
      </a-form>
      <a-descriptions v-if="result" title="调用结果">
        <a-descriptions-item v-for="(res, index) in result" :key="index" :label="`返回值${index}`">
          <lg-hash v-if="res && res.type === 'LongString'" :hash="res.value" :width="80"/>
          <p v-else>{{res}}</p>
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script>
import header from '../common/header'
import lgHash from '../common/lgHash'
import utils from '../utils'
export default {
  components: {
    'lg-hash': lgHash,
    'header-dtl': header
  },
  data () {
    return {
      callForm: this.$form.createForm(this, { name: 'callMethod' }),
      result: null
    }
  },
  computed: {
    params () {
      return JSON.parse(this.$route.query.params).params
    }
  },
  created () {
    this.$store.commit({
      type: 'SET_CURRENT_VUE',
      instance: this
    })
  },
  methods: {
    onCallMethodSubmit (e) {
      const self = this
      e.preventDefault()
      this.callForm.validateFields(async (err, values) => {
        if (err) {
          return
        }
        console.log('Received values of form: ', values)

        const execFunc = async function (execType = 'call') {
          const uri = `/eth-pchain/api/v1/solidity/exec/${execType}/${self.$route.query.method}`
          let res = await utils.reqBackend(uri, 'post', {
            contractName: self.$route.query.ctrtName,
            contractAddr: self.$route.query.ctrtAddr,
            params: values.params ? Object.values(values.params) : undefined
          })
          if (self.$route.query.send) {
            self.result = [{
              type: 'LongString',
              value: res.transactionHash
            }]
          } else {
            self.result = [res]
          }
        }

        if (self.$route.query.send) {
          const modal = self.$confirm({
            title: '确认操作',
            content: '该函数的执行会发送交易，确定执行？',
            async onOk () {
              await utils.reqChain('miner_start')
              await execFunc('send')
              await utils.reqChain('miner_stop')
              modal.destroy()
            }
          })
        } else {
          await execFunc()
        }
      })
    }
  }
}
</script>

<style>
.contract-panel {
  padding: 10px 10px;
  position: fixed;
  top: 67px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
}
</style>
