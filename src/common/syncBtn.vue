<template>
  <a-button
    class="float-button"
    :type="$store.state.syncing.value ? 'primary' : 'default'"
    shape="circle"
    size="large"
    @click="$store.commit('TOGGLE_SYNC')"
  >
    <a-icon type="sync" :spin="$store.state.syncing.value"/>
  </a-button>
</template>

<style>
.float-button {
  position: fixed;
  bottom: 70px;
  right: 20px;
}
</style>
