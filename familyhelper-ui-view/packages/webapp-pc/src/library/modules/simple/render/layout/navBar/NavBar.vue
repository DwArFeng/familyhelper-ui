<template>
  <div class="nav-bar-container">
    <breadcrumb class="nav-breadcrumb" />
    <div class="placeholder" />
    <digital-watch class="nav-digital-watch" />
    <avatar class="nav-avatar" />
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from './Breadcrumb.vue'
import DigitalWatch from './DigitalWatch.vue'
import Avatar from './Avatar.vue'

defineOptions({
  name: 'NavBar',
})
</script>

<style scoped>
.nav-bar-container {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  border-bottom: 1px solid #e4e7ed;
  padding-top: 2px;
  color: #889aa4;
  position: relative;
  z-index: 100;
}

.placeholder {
  width: 0;
  flex-grow: 1;
}

.nav-breadcrumb {
  margin-left: 8px;
}

.nav-avatar {
  height: 100%;
  margin-right: 12px;
}
</style>
