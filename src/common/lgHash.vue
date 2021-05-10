<template>
  <a-row :style="`width: ${width}vw`">
    <a-col :span="22">
      <p class="long-hash">{{hash}}</p>
    </a-col>
    <a-col :span="2">
      <a-button class="p-0" type="link">
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
