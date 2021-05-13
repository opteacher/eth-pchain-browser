<template>
  <a-button
    :class="{'float-button': float}"
    :type="$store.state.syncing.value ? 'primary' : 'default'"
    shape="circle"
    :size="float ? 'large' : 'default'"
    @click="$store.commit('TOGGLE_SYNC')"
  >
    <a-icon type="sync" :spin="$store.state.syncing.value"/>
  </a-button>
</template>

<script>
export default {
  props: {
    float: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style>
.float-button {
  position: fixed;
  bottom: 70px;
  right: 20px;
}
</style>
