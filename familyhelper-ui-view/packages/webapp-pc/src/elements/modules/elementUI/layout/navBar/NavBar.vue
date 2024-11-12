<template>
  <div class="nav-bar-container">
    <hamburger class="nav-hamburger"/>
    <breadcrumb class="nav-breadcrumb"/>
    <div class="placeholder"/>
    <digital-watch class="nav-digital-watch"/>
    <div class="nav-button-group">
      <!--suppress JSUnresolvedVariable -->
      <icon-button
        class="nav-icon-button"
        :icon="isFullScreen ? '\ufffd' : '\ufffc'"
        @click="handleToggleFullScreen"
      />
    </div>
    <avatar class="nav-avatar"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Hamburger from './Hamburger.vue';
import Breadcrumb from './Breadcrumb.vue';
import DigitalWatch from './DigitalWatch.vue';
import IconButton from './IconButton.vue';
import Avatar from './Avatar.vue';

// noinspection JSAnnotator
export default {
  name: 'NavBar',
  components: {
    IconButton,
    DigitalWatch,
    Hamburger,
    Breadcrumb,
    Avatar,
  },
  computed: {
    ...mapGetters('elements', ['isFullScreen']),
  },
  methods: {
    handleToggleFullScreen() {
      this.setFullScreen(!this.isFullScreen)
        .catch(() => {});
    },
    ...mapActions('elements', ['setFullScreen']),
  },
};
</script>

<style scoped>
.nav-bar-container {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  background-color: #FFFFFF;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  padding-top: 2px;
  color: #889AA4;
}

.placeholder {
  width: 0;
  flex-grow: 1;
}

.nav-hamburger {
  height: 100%;
}

.nav-breadcrumb {
  margin-left: 8px;
}

.nav-button-group{
  height: 100%;
  display: flex;
  flex-direction:row;
  align-items: center;
}

.nav-icon-button {
  height: 100%;
}

.nav-icon-button:first-child{
  margin-left:12px;
}

.nav-icon-button:last-child{
  margin-right: 12px;
}

.nav-avatar{
  height: 100%;
  margin-right: 12px;
}
</style>
