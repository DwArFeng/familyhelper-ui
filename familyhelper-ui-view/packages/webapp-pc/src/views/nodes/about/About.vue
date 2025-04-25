<template>
  <div class="about-container">
    <border-layout-panel>
      <template v-slot:default>
        <div class="hiddenBricks" @click="hiddenBricksClick" />
        <div class="content-wrapper">
          <div class="title-bar">关于家庭助手</div>
          <el-divider class="content-divider" />
          <el-form class="detail-form" label-position="left" label-width="80px" inline>
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
      v-model:visible="gameFloatyVisible"
      title="2048小游戏"
      show-dock-button
      show-opacity-button
      show-content-mask
      :z-index="100"
      :min-width="550"
      :min-height="200"
      :initial-x="500"
      :initial-y="100"
      :initial-height="700"
      :initial-width="650"
      :initial-dock-status="0"
      :initial-content-opacity="100"
    >
      <bodh-component v-if="gameType === 1" :gaming="gameFloatyVisible && gameType === 1" />
    </floaty-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BorderLayoutPanel from '@/components/layout/borderLayoutPanel/BorderLayoutPanel.vue'
import FloatyDialog from '@/components/dialog/floatyDialog/FloatyDialog.vue'
import BodhComponent from '@/views/nodes/about/games/Bodh.vue'

defineOptions({
  name: 'AboutComponent',
})

const gameFloatyVisible = ref<boolean>(false)
const gameType = ref<number>(1)

const gameTypes: number[] = [1]

let hiddenButtonClickCount: number = 0

function hiddenBricksClick(): void {
  hiddenButtonClickCount++
  if (hiddenButtonClickCount < 10) {
    return
  }
  // 随机在游戏列表中选择一个游戏
  gameType.value = gameTypes[Math.floor(Math.random() * gameTypes.length)]
  gameFloatyVisible.value = true
  hiddenButtonClickCount = 0
}
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

.detail-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 50px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 50px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item__label) {
  font-size: 25px;
}

/*noinspection CssUnusedSymbol*/
.detail-form :deep(.el-form-item__content) {
  line-height: 50px;
  font-size: 25px;
}

.content-divider {
  margin-bottom: 80px;
}
</style>
