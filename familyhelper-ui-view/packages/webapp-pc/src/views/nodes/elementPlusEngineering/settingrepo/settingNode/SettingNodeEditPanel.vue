<template>
  <div class="setting-node-edit-panel-container">
    <placeholder-panel
      v-if="loading"
      :text="t('views.element_plus_engineering.settingrepo.querying_setting_node')"
    />
    <placeholder-panel
      v-else-if="settingNodeInvalid"
      :text="t('views.element_plus_engineering.settingrepo.setting_node_unavailable')"
    />
    <text-node-sub-edit-panel
      v-else-if="settingNode?.type === 0"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <long-text-node-sub-edit-panel
      v-else-if="settingNode?.type === 1"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <image-node-sub-edit-panel
      v-else-if="settingNode?.type === 2"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <image-list-node-sub-edit-panel
      v-else-if="settingNode?.type === 3"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <iahn-node-sub-edit-panel
      v-else-if="settingNode?.type === 4"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <file-node-sub-edit-panel
      v-else-if="settingNode?.type === 5"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <file-list-node-sub-edit-panel
      v-else-if="settingNode?.type === 6"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <navigation-node-sub-edit-panel
      v-else-if="settingNode?.type === 7"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <kv-node-sub-edit-panel
      v-else-if="settingNode?.type === 8"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <text-list-node-sub-edit-panel
      v-else-if="settingNode?.type === 9"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <video-node-sub-edit-panel
      v-else-if="settingNode?.type === 10"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <video-list-node-sub-edit-panel
      v-else-if="settingNode?.type === 11"
      :category="settingNode?.category"
      :args="settingNode?.args"
      :readonly="readonly"
    />
    <placeholder-panel
      v-else
      :text="t('views.element_plus_engineering.settingrepo.unknown_node_type')"
    />
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { computed, onMounted, ref, watch } from 'vue'

import { type NotificationHandle } from 'element-plus'
import { ElNotification } from 'element-plus'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import TextNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/TextNodeSubEditPanel.vue'
import LongTextNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/LongTextNodeSubEditPanel.vue'
import ImageNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/ImageNodeSubEditPanel.vue'
import ImageListNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/ImageListNodeSubEditPanel.vue'
import IahnNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/IahnNodeSubEditPanel.vue'
import FileNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/FileNodeSubEditPanel.vue'
import FileListNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/FileListNodeSubEditPanel.vue'
import NavigationNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/NavigationNodeSubEditPanel.vue'
import KvNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/KvNodeSubEditPanel.vue'
import TextListNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/TextListNodeSubEditPanel.vue'
import VideoNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/VideoNodeSubEditPanel.vue'
import VideoListNodeSubEditPanel from '@/views/nodes/elementPlusEngineering/settingrepo/settingNode/subPanels/VideoListNodeSubEditPanel.vue'

import {
  type SettingNode,
  type SettingNodeType,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { inspect } from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import { resolveResponse } from '@/util/response.ts'

import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SettingNodeEditPanel',
})

// region Props 定义

type Props = {
  id: string
  readonly?: boolean
  watchingRouteName?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  watchingRouteName: '',
})

// endregion

// region I18n 引入

const { t } = useI18n()

// endregion
// region Router 引入

const router = vim.ctx().router().vueRouter()

// endregion

// region 加载逻辑

const loading = ref<number>(0)

// endregion

// region 配置节点

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

// endregion

// region 提醒处理

const IMAGE_TYPES: SettingNodeType[] = [2, 3]
const VIDEO_TYPES: SettingNodeType[] = [10, 11]

const notifyShow = ref<boolean>(false)
const notifyHandle = ref<NotificationHandle | null>(null)
const notifyMessage = ref<string>('')

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
          t('views.element_plus_engineering.settingrepo.thumbnail_preview_notice') +
          t('views.element_plus_engineering.settingrepo.original_image_download_security_warning') +
          '</div>',
      }
    }
    // 展示视频缩略图的通知。
    if (VIDEO_TYPES.some((type) => type === settingNodeValue.type)) {
      return {
        shouldShow: true,
        message:
          '<div style="line-height: 20px">' +
          t('views.element_plus_engineering.settingrepo.thumbnail_preview_notice') +
          t('views.element_plus_engineering.settingrepo.original_video_download_security_warning') +
          '</div>',
      }
    }
    // 如无命中，则不显示通知。
    return { shouldShow: false, message: '' }
  }

  const { shouldShow, message } = checkStatus()

  if (shouldShow) {
    if (notifyShow.value && notifyMessage.value === message) {
      return
    }
    notifyHandle.value?.close()
    notifyMessage.value = message
    notifyShow.value = true
    notifyHandle.value = ElNotification({
      title: t('views.element_plus_engineering.settingrepo.usage_hint'),
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
        notifyMessage.value = ''
      },
    })
    return
  }
  if (notifyShow.value) {
    if (!notifyHandle.value) {
      throw new Error(
        t('views.element_plus_engineering.settingrepo.unexpected_execution_contact_developer'),
      )
    }
    notifyHandle.value.close()
    notifyShow.value = false
    notifyHandle.value = null
    notifyMessage.value = ''
  }
}

onMounted(() => {
  updateNotify(router.currentRoute.value.name as string)
})

// endregion
</script>

<style scoped>
.setting-node-edit-panel-container {
  width: 100%;
  height: 100%;
}
</style>
