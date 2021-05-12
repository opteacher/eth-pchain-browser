<template>
  <div>
    <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="调用智能合约接口"
      @back="$router.go(-1)"
    />
    <div style="padding: 10px 10px; position: fixed; top: 67px; left: 0; right: 0; bottom: 0; overflow-y: scroll">
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
          v-for="param in $route.query.params"
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
          {{res}}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script>
import lgHash from '../common/lgHash'
import utils from '../utils'
export default {
  components: {
    'lg-hash': lgHash
  },
  data () {
    return {
      callForm: this.$form.createForm(this, { name: 'callMethod' }),
      result: null
    }
  },
  methods: {
    onCallMethodSubmit (e) {
      e.preventDefault()
      this.callForm.validateFields(async (err, values) => {
        if (err) {
          return
        }
        console.log('Received values of form: ', values)

        const url = `/eth-pchain/api/v1/solidity/call/${this.$route.query.method}`
        const res = await utils.reqBackend(url, 'post', {
          contractName: this.$route.query.ctrtName,
          contractAddr: this.$route.query.ctrtAddr,
          params: values.params ? Object.values(values.params) : undefined
        })
        this.result = [res]
      })
    }
  }
}
</script>
