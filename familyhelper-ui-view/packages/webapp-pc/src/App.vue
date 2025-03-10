<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'App',
})
</script>

<style>
@import 'assets/css/global.css';
</style>

<style lang="css">
#app {
  height: 100%;
  width: 100%;
}
</style>
