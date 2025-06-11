<template>
  <div
    :class="size <= 44 ? 'loading-spinner__s24' : ''"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-loading="display.loading"
  >
    <el-avatar
      class="avatar-panel-container"
      fit="contain"
      :size="size"
      :shape="shape"
      :src="display.avatarUrl"
    >
      <div class="placeholder">{{ computedDisplayName }}</div>
    </el-avatar>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import {
  exists,
  inspectDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/system/account.ts'
import { download } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/avatar.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'AvatarPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  renderMode?: 'BY_ID' | 'BY_CONTENT'
  shape?: 'square' | 'circle'
  size?: number
  placeholderFontSize?: number
  /**
   * 客体用户 ID，此处 Object 不是对象的意思。
   */
  objectUserId?: string
  displayName?: string
  avatarUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  renderMode: 'BY_ID',
  shape: 'square',
  size: 180,
  placeholderFontSize: 32,
  objectUserId: '',
  displayName: '',
  avatarUrl: '',
})

// 显示。
type Display = {
  loading: number
  displayName: string
  avatarUrl: string
}

const display = ref<Display>({
  loading: 0,
  displayName: '',
  avatarUrl: '',
})

const computedDisplayName = computed<string>(() => {
  if (display.value.displayName === '') {
    return ''
  }
  return display.value.displayName.charAt(0)
})

function update(): void {
  if (props.renderMode === 'BY_ID') {
    updateById()
  } else if (props.renderMode === 'BY_CONTENT') {
    updateByContent()
  }
}

function updateById(): void {
  display.value.loading += 1
  resolveResponse(inspectDisp({ string_id: props.objectUserId }))
    .then((res) => {
      display.value.displayName = res.display_name
    })
    .then(() => resolveResponse(exists({ string_id: props.objectUserId })))
    .then(async (res) => {
      if (res) {
        const blob = await download({ string_id: props.objectUserId })
        return window.URL.createObjectURL(blob)
      }
      return Promise.resolve('')
    })
    .then((res) => {
      display.value.avatarUrl = res
    })
    .catch(() => {})
    .finally(() => {
      display.value.loading -= 1
    })
}

function updateByContent(): void {
  display.value.loading += 1
  display.value.displayName = props.displayName
  display.value.avatarUrl = props.avatarUrl
  display.value.loading -= 1
}

watch(
  () => props.renderMode,
  (_, oldValue) => {
    const tempUrl: string = display.value.avatarUrl
    update()
    if (oldValue === 'BY_ID') {
      window.URL.revokeObjectURL(tempUrl)
    }
  },
)

watch(
  () => props.objectUserId,
  () => {
    if (props.renderMode === 'BY_ID') {
      update()
    }
  },
)

watch(
  () => props.displayName,
  () => {
    if (props.renderMode === 'BY_CONTENT') {
      update()
    }
  },
)

watch(
  () => props.avatarUrl,
  () => {
    if (props.renderMode === 'BY_CONTENT') {
      update()
    }
  },
)

onMounted(() => {
  update()
})

onUnmounted(() => {
  const url = display.value.avatarUrl
  if (props.renderMode === 'BY_ID' && url) {
    window.URL.revokeObjectURL(url)
  }
})
</script>

<style scoped>
.avatar-panel-container {
  height: v-bind(size + 'px');
  width: v-bind(size + 'px');
}

.placeholder {
  user-select: none;
  white-space: nowrap;
  text-overflow: clip;
  overflow: hidden;
  font-size: v-bind(placeholderFontSize + 'px');
}
</style>
