<template>
  <layout actTab="solidity">
    <a-card class="w-100" title="部署智能合约" size="small">
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
                <a-list-item slot="renderItem" slot-scope="item, index">{{item.name}}</a-list-item>
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
        <a-form-item label="发布账户">
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
          <a-input-password
            placeholder="输入账户密码"
            v-decorator="['password']"
          />
        </a-form-item>
        <a-form-item v-if="selSolidity.name" label="gas费用">
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
        <a-button type="primary" block html-type="submit">
          部署
        </a-button>
      </a-form>
    </a-card>
    <a-card v-if="newContract.contractAddress"
      class="w-100 mt-5" :title="newContract.name" size="small"
    >
      <a-descriptions bordered size="small">
        <a-descriptions-item label="合约地址">
          <lg-hash :hash="newContract.contractAddress" :width="55"/>
        </a-descriptions-item>
        <a-descriptions-item label="交易哈希">
          <lg-hash :hash="newContract.transactionHash" :width="55"/>
        </a-descriptions-item>
      </a-descriptions>
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
      deploy: this.$form.createForm(this, {name: 'deploy'}),
      newContract: {}
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
              name: item.name
            })
            break
        }
      }
    },
    async onSgstGasClicked () {
      const path = `/eth-pchain/api/v1/solidity/deploy/gas?jsonPath=${
        this.selSolidity.jsonPath
      }`
      this.deploy.setFieldsValue(await utils.reqBackend(path, 'get'))
    }
  }
}
</script>

<style>
.ant-collapse-content-box {
  padding: 0 10px !important;
}
</style>
