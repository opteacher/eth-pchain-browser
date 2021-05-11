<template>
  <layout actTab="solidity">
    <a-card class="w-100" title="部署智能合约" size="small">
      <a-form :form="deploy" @submit="onDeployClicked">
        <a-form-item>
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
        <a-form-item>
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
        <a-form-item>
          <a-input-password
            placeholder="输入账户密码"
            :disabled="selAccount === ''"
            v-decorator="['password']"
          />
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
      selSolidity: '',
      selAccount: '',
      deploy: this.$form.createForm(this, {name: 'deploy'}),
      newContract: {}
    }
  },
  created () {
    this.$store.commit({
      type: 'setCurrentVue',
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
            const path = '/eth-pchain/api/v1/solidity/deploy'
            const res = await utils.reqBackend(path, 'post', {
              solPath: values.solidity,
              accAddr: values.account,
              accPswd: values.password || ''
            })
            self.newContract = res[self.selSolidity]
            self.newContract.name = self.selSolidity
            modal.destroy()
            self.$message.success('部署成功！')
          }
        })
      })
    },
    onAccChanged (e) {
      this.selAccount = e
    },
    onSolChanged () {
      this.selSolidity = arguments[1].key
    }
  }
}
</script>
