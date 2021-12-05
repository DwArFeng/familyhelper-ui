<template>
  <div class="border-layout-panel-container">
    <div class="main-area" >
      <!-- Header -->
      <el-card
        v-if="headerVisible"
        class="box-card-header" body-style="height: calc(100% - 30px); padding: 15px">
        <slot name="header"/>
      </el-card>
      <!-- Center Area -->
      <div class="center-area">
        <!-- West -->
        <el-card
          v-if="westVisible"
          class="box-card-west" body-style="height: calc(100% - 30px); padding: 15px">
          <slot name="west"/>
        </el-card>
        <!-- Main -->
        <el-card class="box-card-main" body-style="height: calc(100% - 30px); padding: 15px">
          <slot/>
        </el-card>
        <!-- East -->
        <el-card
          v-if="eastVisible"
          class="box-card-east" body-style="height: calc(100% - 30px); padding: 15px">
          <slot name="east"/>
        </el-card>
      </div>
      <!-- Footer -->
      <el-card
        v-if="footerVisible"
        class="box-card-footer" body-style="height: calc(100% - 30px); padding: 15px">
        <slot name="footer"/>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BorderLayoutPanel',
  props: {
    breadcrumb: {
      type: Array,
      default: () => [],
    },
    headerVisible: {
      type: Boolean,
      default: () => false,
    },
    footerVisible: {
      type: Boolean,
      default: () => false,
    },
    westVisible: {
      type: Boolean,
      default: () => false,
    },
    eastVisible: {
      type: Boolean,
      default: () => false,
    },
  },
};
</script>

<style scoped>
.border-layout-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-area {
  width: 100%;
  height: 0;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.center-area {
  height: 0;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.box-card-header {
  margin-bottom: 5px;
}

.box-card-footer {
  margin-top: 5px;
}

.box-card-west {
  margin-right: 5px;
}

.box-card-east {
  margin-left: 5px;
}

.box-card-main {
  width: 0;
  flex-grow: 1;
}
</style>
