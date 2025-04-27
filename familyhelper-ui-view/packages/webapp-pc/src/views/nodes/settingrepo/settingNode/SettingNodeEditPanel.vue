<template>
  <div class="setting-node-edit-panel-container">
    <div class="placeholder" v-if="loading">正在查询配置节点信息...</div>
    <div class="placeholder" v-else-if="settingNodeInvalid">无法查看或编辑配置节点</div>
    <text-node-sub-edit-panel
      v-else-if="settingNode?.type === 0"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <image-node-edit-panel
      v-else-if="settingNode?.type === 2"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <image-list-node-edit-panel
      v-else-if="settingNode?.type === 3"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <div class="placeholder" v-else>节点类型未知，无法查看或编辑</div>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, ref, watch } from 'vue'

import { type NotificationHandle } from 'element-plus'
import { ElNotification } from 'element-plus'

import TextNodeSubEditPanel from '@/views/nodes/settingrepo/settingNode/subPanels/TextNodeSubEditPanel.vue'
import ImageNodeEditPanel from '@/views/nodes/settingrepo/settingNode/subPanels/ImageNodeEditPanel.vue'
import ImageListNodeEditPanel from '@/views/nodes/settingrepo/settingNode/subPanels/ImageListNodeEditPanel.vue'

import {
  type SettingNode,
  type SettingNodeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { inspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'SettingNodeEditPanel',
})

// -----------------------------------------------------------Router 引入-----------------------------------------------------------
const router = vim.ctx().router().vueRouter()

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  id: string
  readonly?: boolean
  watchingRouteName?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  watchingRouteName: '',
})

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------配置节点-----------------------------------------------------------
const settingNode = ref<SettingNode | null>(null)

const settingNodeInvalid = computed(() => {
  if (settingNode.value === null) {
    return true
  }
  const { category, args } = settingNode.value
  return category === null || args === null
})

watch(
  () => props.id,
  (value) => {
    handleInspectSettingNode(value)
  },
)

async function handleInspectSettingNode(id: string): Promise<void> {
  if (id === '') {
    settingNode.value = null
    updateNotify(router.currentRoute.value.name as string)
    return
  }
  loading.value += 1
  try {
    settingNode.value = await resolveResponse(inspect({ string_id: id }))
  } catch {
    settingNode.value = null
  } finally {
    loading.value -= 1
  }
  updateNotify(router.currentRoute.value.name as string)
}

onMounted(() => {
  handleInspectSettingNode(props.id)
})
// -----------------------------------------------------------提醒处理-----------------------------------------------------------
const IMAGE_TYPES: SettingNodeType[] = [2, 3]

const notifyShow = ref<boolean>(false)
const notifyHandle = ref<NotificationHandle | null>(null)

watch(router.currentRoute, (value) => {
  updateNotify(value.name as string)
})

function updateNotify(currentRouteName: string): void {
  function checkStatus(): { shouldShow: boolean; message: string } {
    if (props.watchingRouteName === '' || props.watchingRouteName === undefined) {
      return { shouldShow: false, message: '' }
    }
    if (loading.value > 0) {
      return { shouldShow: false, message: '' }
    }
    if (currentRouteName !== props.watchingRouteName) {
      return { shouldShow: false, message: '' }
    }
    const settingNodeValue = settingNode.value
    if (!settingNodeValue) {
      return { shouldShow: false, message: '' }
    }
    // 展示图片的通知。
    if (IMAGE_TYPES.some((type) => type === settingNodeValue.type)) {
      return {
        shouldShow: true,
        message:
          '<div style="line-height: 20px">' +
          '显示内容使用的是缩略图，清晰度较低，仅供预览。<br>' +
          '<b>请勿截屏或使用浏览器的保存图片功能！</b><br>如需下载原图，请点击下载按钮。' +
          '</div>',
      }
    }
    // 如无命中，则不显示通知。
    return { shouldShow: false, message: '' }
  }

  const { shouldShow, message } = checkStatus()

  if (shouldShow && !notifyShow.value) {
    notifyShow.value = true
    notifyHandle.value = ElNotification({
      title: '使用提示',
      customClass: 'custom-message-box__w450',
      message: message,
      dangerouslyUseHTMLString: true,
      type: 'info',
      position: 'bottom-right',
      offset: 75,
      duration: 0,
      onClose: () => {
        notifyShow.value = false
        notifyHandle.value = null
      },
    })
  } else if (!shouldShow && notifyShow.value) {
    if (!notifyHandle.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    notifyHandle.value.close()
    notifyShow.value = false
    notifyHandle.value = null
  }
}

onMounted(() => {
  updateNotify(router.currentRoute.value.name as string)
})
</script>

<style scoped>
.setting-node-edit-panel-container {
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}
</style>
