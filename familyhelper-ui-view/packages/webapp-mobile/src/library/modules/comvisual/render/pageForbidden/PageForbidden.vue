<template>
  <div class="page-forbidden-container">
    <error-panel>
      <template v-slot:default>
        <div class="error-content-container">
          <span class="error-header-title-chs">权限禁止</span>
          <textarea class="error-message-container" v-model="textarea" readonly></textarea>
        </div>
      </template>
    </error-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ErrorPanel from '../error/ErrorPanel.vue'

defineOptions({
  name: 'PageForbidden',
})

// region 报错文本

const ERROR_TEXT: string = `结界防御系统启动 (๑•̀д•́๑)

您遇到了神圣结界阻挡，可能因为：

🔐【权限封印未解除】
症状：输入了正确地址但无法进入
触发条件：
- 试图访问长老会密室（高权限页面）
- 当前身份是见习魔法师（权限等级不足）
解除方法：
1. 检查是否佩戴了正确的职业徽章（账号角色）
2. 向大法师提交准入申请（联系管理员）
3. 返回公共休息区（首页）

🕰️【时间魔法失效】
症状：昨天还能自由出入的区域
异常状态：
- 佩戴了错误的刻印指环（登录账号错误）
- 被移除了冒险者名单（权限被收回）

🐞【结界裂隙】
症状：进行正确操作却触发警报？
异常波动：
- 魔法阵临时性能量紊乱（系统缓存异常）
- 结界守卫程序突发性暴走（权限校验故障）
应急修复：
1. 重新绘制契约符文（退出后重新登录）
2. 召唤结界师团队（附上错误截图更佳）

特别通关秘籍：
1. 重置世界：清除浏览器缓存
2. 召唤管理员：传送门已开启 → 915724865@qq.com
`
const textarea = ref<string>(ERROR_TEXT)

// endregion
</script>

<style scoped>
.page-forbidden-container {
  height: 100%;
  width: 100%;
}

.error-content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-header-title-chs {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  font-family: 微软雅黑, serif;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
  margin-bottom: 20px;
}

.error-message-container {
  width: 100%;
  flex-grow: 1;
  height: 100%;
  background: #ffffff;
  font-size: 14px;
  font-family: 微软雅黑, serif;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  resize: none;
  box-sizing: border-box;
  line-height: 1.6;
  color: #606266;
}

.error-message-container:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
</style>
