<template>
  <div class="page-not-found-container">
    <error-panel>
      <template v-slot:default>
        <div class="error-content-container">
          <span class="error-header-title-chs">页面不存在</span>
          <el-input
            class="error-message-container"
            type="textarea"
            v-model="textarea"
            resize="none"
            readonly
          >
          </el-input>
        </div>
      </template>
    </error-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ErrorPanel from '@/library/modules/elementPlus/render/error/ErrorPanel.vue'

defineOptions({
  name: 'PageNotFound',
})

// region 报错文本

const ERROR_TEXT: string = `您进入了未知领域 (๑•́ ₃ •̀๑)

请检查以下可能的小意外：

🕵️【探险家模式】
症状：地址栏输入了神秘代码？
可能原因：
- 手动输入了魔法咒语（网址拼写错误）
- 复制了不完整的传送门链接
解决方法：
1. 仔细核对地址栏的字符序列
2. 试试从左侧导航菜单重新传送
3. 直接召唤首页传送门：删除地址栏 # 以及后面的所有内容

🔄【版本进化事件】
症状：昨天还能用的功能突然消失？
可能原因：
- 系统进行了魔法升级
- 功能模块已进化成更强大的形态
解决姿势：
1. 查看导航菜单是否还有该入口
2. 在更新日志中寻找线索
3. 喝杯茶稍等片刻，新功能正在加载中...

🐞【程序精灵走失】
症状：通过正常导航仍然到达这里？
异常提示：
- 可能是界面导航地图出现错乱
- 或是参数传递时发生了量子纠缠
应急方案：
1. 返回安全坐标（返回首页）
2. 联系我们的空间维护师（附上错误截图更佳）

特别通关秘籍：
1. 重置世界：清除浏览器缓存
2. 召唤管理员：传送门已开启 → 915724865@qq.com
`
const textarea = ref<string>(ERROR_TEXT)

// endregion
</script>

<style scoped>
.page-not-found-container {
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
  font-size: 58px;
  font-family: 微软雅黑, serif;
  color: #7bbdff;
  text-shadow: 0 0 8px black;
  margin-bottom: 10px;
}

.error-message-container {
  width: 100%;
  flex-grow: 1;
}

/*noinspection CssUnusedSymbol*/
.error-message-container :deep(.el-textarea__inner) {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-family: 微软雅黑, serif;
}
</style>
