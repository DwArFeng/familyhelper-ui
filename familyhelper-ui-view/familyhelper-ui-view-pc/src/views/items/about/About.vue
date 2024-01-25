<template>
  <div class="about-container">
    <border-layout-panel>
      <template v-slot:default>
        <div class="hiddenBricks" @click="hiddenBricksClick"/>
        <div class="content-wrapper">
          <div class="title-bar">
            关于家庭助手
          </div>
          <el-divider class="content-divider"/>
          <el-form
            class="detail-form"
            label-position="left"
            label-width="80px"
            inline
          >
            <el-form-item label-width="120px" label="作者" style="width: 100%">
              赵扶风
            </el-form-item>
            <el-form-item label-width="120px" label="软件架构" style="width: 100%">
              微服务 + 中台 + 前端
            </el-form-item>
            <el-form-item label-width="120px" label="部署方式" style="width: 100%">
              个人工控机实机部署
            </el-form-item>
            <el-form-item label-width="120px" label="联系方式" style="width: 100%">
              915724865@qq.com
            </el-form-item>
          </el-form>
        </div>
      </template>
    </border-layout-panel>
    <floaty-dialog
      show-dock-button
      show-opacity-button
      show-content-mask
      :visible.sync="panelFloaty.visible"
      :title="panelFloaty.title"
      :z-index="100"
      :min-width="550"
      :min-height="200"
      :initial-x="panelFloaty.initialX"
      :initial-y="panelFloaty.initialY"
      :initial-height="panelFloaty.initialHeight"
      :initial-width="panelFloaty.initialWidth"
      :initial-dock-status="panelFloaty.initialDockStatus"
      :initial-content-opacity="panelFloaty.initialContentOpacity"
    >
      <div style="background-color: white">
        <game2048
          v-if="panelFloaty.type===0"
        />
      </div>
    </floaty-dialog>
  </div>
</template>

<script>
import BorderLayoutPanel from '@/components/layout/BorderLayoutPanel.vue';
import Game2048 from '@/views/items/about/game/Game2048.vue';
import FloatyDialog from '@/components/layout/FloatyDialog.vue';

export default {
  name: 'About',
  data() {
    return {
      game2048: 1,
      panelFloaty: {
        visible: false,
        title: '',
        type: 0,
        initialX: 500,
        initialY: 200,
        initialHeight: 640,
        initialWidth: 400,
        initialDockStatus: 0,
        initialContentOpacity: 100,
      },
    };
  },
  components: { Game2048, BorderLayoutPanel, FloatyDialog },
  methods: {
    hiddenBricksClick() {
      this.game2048 += 1;
      if (this.game2048 >= 10) {
        this.panelFloaty.title = '2048';
        this.panelFloaty.type = 0;
        this.panelFloaty.visible = true;
      }
    },
  },
};
</script>

<style scoped>
.about-container {
  width: 100%;
  height: 100%;
}

.hiddenBricks {
  height: 30px;
  width: 30px;
  cursor: pointer;
}

.content-wrapper {
  width: 100%;
  height: 100%;
  padding: 50px 300px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-bar {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50px;
  font-weight: bold;
  color: #303133;
  user-select: none;
}

.detail-form {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.detail-form >>> label {
  width: 240px;
  color: #99a9bf;
  line-height: 50px;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item__content {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 50px;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item__label {
  font-size: 25px;
}

/*noinspection CssUnusedSymbol*/
.detail-form >>> .el-form-item__content {
  line-height: 50px;
  font-size: 25px;
}

.content-divider{
  margin-bottom: 80px;
}
</style>
