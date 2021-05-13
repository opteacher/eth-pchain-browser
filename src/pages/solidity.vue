<template>
  <layout actTab="solidity">
    <a-card class="w-100" title="部署/调用智能合约" size="small">
      <a-form :form="deploy" @submit="onDeployClicked">
        <a-form-item label="智能合约">
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="20">
                <a-select class="w-100" placeholder="选择一个合约"
                  v-decorator="['solidity', {
                    rules: [{ required: true, message: '必须选择一个合约!' }]
                  }]" @change="onSolChanged"
                >
                  <a-select-option v-for="sol in solidities"
                    :key="sol.name" :value="sol.path"
                  >
                    {{sol.name}}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="4">
                <a-button class="w-100" icon="sync" @click="refsSolidities"/>
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
        <a-form-item v-if="selSolidity.name" label="合约详情">
          <a-collapse expand-icon-position="right">
            <a-collapse-panel header="接口"
              v-if="selSolidity.struct.functions && selSolidity.struct.functions.length"
            >
              <a-list :data-source="selSolidity.struct.functions">
                <a-list-item slot="renderItem" slot-scope="item, index">
                  <div>
                    {{item.name}}
                    <a-tag v-if="item.payable" color="green">发送交易</a-tag>
                  </div>
                  <a v-if="selSolidity.contractAddress" slot="actions"
                    @click="onMethodCallClicked(item.name)"
                  >调用</a>
                </a-list-item>
              </a-list>
            </a-collapse-panel>
            <a-collapse-panel header="事件"
              v-if="selSolidity.struct.events && selSolidity.struct.events.length"
            >
              <a-list :data-source="selSolidity.struct.events">
                <a-list-item slot="renderItem" slot-scope="item, index">{{item.name}}</a-list-item>
              </a-list>
            </a-collapse-panel>
          </a-collapse>
        </a-form-item>
        <a-form-item v-if="!selSolidity.contractAddress" label="发布账户">
          <a-select class="w-100" placeholder="选择发布合约的账户"
            v-decorator="['account', {
              rules: [{ required: true, message: '必须选择一个发布合约的账户!' }]
            }]" @change="onAccChanged"
          >
            <a-select-option v-for="acc in $store.state.accounts.value"
              :key="acc.address" :value="acc.address"
            >
              {{acc.address}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="selAccount" label="账户密码">
          <a-input-password placeholder="输入账户密码" v-decorator="['password']"/>
        </a-form-item>
        <a-form-item v-if="!selSolidity.contractAddress && selSolidity.name" label="gas费用">
          <a-input-group>
            <a-row :gutter="8">
              <a-col :span="14">
                <a-input-number class="w-100"
                  :min="1" :max="$store.state.gasLimit.value"
                  :placeholder="`上限${$store.state.gasLimit.value}`"
                  v-decorator="['gas', {
                    rules: [{ required: true, message: 'gas不能为空!可使用推荐费用' }]
                  }]"
                />
              </a-col>
              <a-col :span="10">
                <a-button class="w-100" type="primary" @click="onSgstGasClicked">
                  推荐费用
                </a-button>
              </a-col>
            </a-row>
          </a-input-group>
        </a-form-item>
        <a-button type="primary" block html-type="submit">部署</a-button>
      </a-form>
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
      solidities: [],
      selSolidity: {
        name: ''
      },
      selAccount: '',
      deploy: this.$form.createForm(this, {name: 'deploy'})
    }
  },
  created () {
    this.$store.commit({
      type: 'SET_CURRENT_VUE',
      instance: this
    })
    this.refsSolidities()
  },
  methods: {
    async refsSolidities () {
      const path = '/eth-pchain/api/v1/solidites'
      const res = await utils.reqBackend(path, 'get')
      this.solidities = []
      for (const [name, path] of Object.entries(res)) {
        this.solidities.push({name, path})
      }
    },
    onDeployClicked (e) {
      const self = this
      e.preventDefault()
      this.deploy.validateFields((err, values) => {
        if (err) {
          return
        }
        const modal = this.$confirm({
          title: '确认操作',
          content: '确认部署该智能合约？',
          async onOk () {
            await utils.reqChain('miner_start')
            const path = '/eth-pchain/api/v1/solidity/deploy'
            const res = await utils.reqBackend(path, 'post', {
              jsonPath: self.selSolidity.jsonPath,
              accAddr: values.account,
              accPswd: values.password,
              gas: values.gas
            })
            await utils.reqChain('miner_stop')
            modal.destroy()
            self.$message.success('部署成功！')
            self.$router.push({
              path: `/eth-pchain/result?txHash=${res.transactionHash}`
            })
          }
        })
      })
    },
    onAccChanged (e) {
      this.selAccount = e
    },
    async onSolChanged (e) {
      const path = `/eth-pchain/api/v1/solidity/json?solPath=${e}`
      const res = await utils.reqBackend(path, 'get')
      const ctrtInfo = res[arguments[1].key]
      this.selSolidity.name = arguments[1].key
      this.selSolidity.jsonPath = ctrtInfo.jsonPath
      this.selSolidity.struct = {
        events: [],
        functions: []
      }
      for (const item of ctrtInfo.abi) {
        switch (item.type) {
          case 'event':
            this.selSolidity.struct.events.push({
              name: item.name
            })
            break
          case 'function':
            this.selSolidity.struct.functions.push({
              name: item.name,
              params: item.inputs.map(input => ({
                name: input.name,
                type: input.type
              })),
              payable: item.payable
            })
            break
        }
      }
      if (ctrtInfo.receipt && ctrtInfo.receipt.contractAddress) {
        this.selSolidity.contractAddress = ctrtInfo.receipt.contractAddress
      }
    },
    async onSgstGasClicked () {
      const path = `/eth-pchain/api/v1/solidity/deploy/gas?jsonPath=${
        this.selSolidity.jsonPath
      }`
      this.deploy.setFieldsValue(await utils.reqBackend(path, 'get'))
    },
    onMethodCallClicked (method) {
      let callFuncInfo = null
      for (const funcInfo of this.selSolidity.struct.functions) {
        if (funcInfo.name === method) {
          callFuncInfo = funcInfo
          break
        }
      }
      this.$router.push({
        path: '/eth-pchain/solidity/call-send',
        query: {
          ctrtName: this.selSolidity.name,
          ctrtAddr: this.selSolidity.contractAddress,
          method,
          params: JSON.stringify({
            params: callFuncInfo.params
          }),
          // 注意：这里把带payable标记的函数都设定为会发送交易，并调用send执行。
          // 但payable和send并不是强关联的，此处这么处理是sol没有很好标记函数的方法，不得已的处理
          send: callFuncInfo.payable
        }
      })
    }
  }
}
</script>

<style>
.ant-collapse-content-box {
  padding: 0 10px !important;
}
</style>
