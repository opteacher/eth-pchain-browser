<template>
  <a-row :style="`width: ${width}vw; margin: 0 auto`">
    <a-col :span="22">
      <p class="long-hash">{{hash}}</p>
    </a-col>
    <a-col :span="2">
      <a-button class="p-0" type="link" @click="copyToClip">
        <a-icon type="copy"/>
      </a-button>
    </a-col>
  </a-row>
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 30
    },
    hash: String
  },
  methods: {
    copyToClip () {
      let aux = document.createElement('input')
      aux.setAttribute('value', this.hash)
      document.body.appendChild(aux)
      aux.select()
      document.execCommand('copy')
      document.body.removeChild(aux)
      this.$message.success('已复制到剪切板！')
    }
  }
}
</script>

<style>
.long-hash {
  margin-top: 5px;
  margin-bottom: 0;
  overflow-x: scroll
}
</style>
