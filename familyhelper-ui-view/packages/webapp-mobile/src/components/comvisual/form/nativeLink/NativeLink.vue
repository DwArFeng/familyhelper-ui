<template>
  <a
    v-if="isLink"
    :href="href"
    :target="target"
    :rel="anchorRel"
    class="native-link"
    :class="rootClasses"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    v-bind="passthroughAttrs"
    @click="onAnchorClick"
  >
    <slot name="default" />
  </a>
  <button
    v-else
    type="button"
    class="native-link"
    :class="rootClasses"
    :disabled="disabled"
    v-bind="passthroughAttrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  name: 'NativeLink',
  inheritAttrs: false,
})

// region Props 定义

type LinkType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

type UnderlineProp = 'always' | 'hover' | 'never' | boolean

type Props = {
  type?: LinkType
  underline?: UnderlineProp
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top'
  disabled?: boolean
  size?: 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  underline: 'always',
  disabled: false,
  size: 'default',
})

// endregion

// region Emits 定义

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

// endregion

// region Slots 定义

defineSlots<{
  // 参数 props: {} 是 vue 约定的类型，故忽略类型警告。
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type
  default?: (props: {}) => any
}>()

// endregion

// region 属性透传

const attrs = useAttrs()

const passthroughAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})

// endregion

// region 模板：锚点链接（a 标签分支）

const isLink = computed(() => {
  const h = props.href
  return (h?.length ?? 0) > 0
})

const anchorRel = computed(() => {
  if (!isLink.value) {
    return undefined
  }
  if (props.target === '_blank') {
    return 'noopener noreferrer'
  }
  return undefined
})

// endregion

// region 根节点 class

const underlineMode = computed(() => {
  const u = props.underline
  if (u === true) {
    return 'always'
  }
  if (u === false) {
    return 'never'
  }
  return u ?? 'always'
})

const rootClasses = computed(() => {
  const { class: cls } = attrs
  return [
    `native-link--type-${props.type}`,
    `native-link--underline-${underlineMode.value}`,
    `native-link--size-${props.size}`,
    { 'is-disabled': props.disabled },
    cls,
  ]
})

// endregion

// region 模板：锚点点击处理

function onAnchorClick(e: MouseEvent): void {
  if (props.disabled) {
    e.preventDefault()
    return
  }
  emit('click', e)
}

// endregion
</script>

<style scoped>
.native-link {
  display: inline;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  line-height: inherit;
  cursor: pointer;
  user-select: none;
  text-align: inherit;
  vertical-align: baseline;
  appearance: none;
  outline: none;
}

.native-link--size-default {
  font-size: 13px;
}

.native-link--size-small {
  font-size: 12px;
}

.native-link:disabled,
.native-link.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.native-link--type-default {
  color: #606266;
}

.native-link--type-default:not(:disabled):not(.is-disabled):hover {
  color: #409eff;
}

.native-link--type-primary {
  color: #409eff;
}

.native-link--type-primary:not(:disabled):not(.is-disabled):hover {
  color: #66b1ff;
}

.native-link--type-success {
  color: #67c23a;
}

.native-link--type-success:not(:disabled):not(.is-disabled):hover {
  color: #85ce61;
}

.native-link--type-warning {
  color: #e6a23c;
}

.native-link--type-warning:not(:disabled):not(.is-disabled):hover {
  color: #ebb563;
}

.native-link--type-danger {
  color: #f56c6c;
}

.native-link--type-danger:not(:disabled):not(.is-disabled):hover {
  color: #f78989;
}

.native-link--type-info {
  color: #909399;
}

.native-link--type-info:not(:disabled):not(.is-disabled):hover {
  color: #a6a9ad;
}

.native-link--underline-always {
  text-decoration: underline;
}

.native-link--underline-never {
  text-decoration: none;
}

.native-link--underline-hover {
  text-decoration: none;
}

.native-link--underline-hover:not(:disabled):not(.is-disabled):hover {
  text-decoration: underline;
}

.native-link--underline-never:disabled,
.native-link--underline-never.is-disabled {
  text-decoration: none;
}

.native-link--underline-hover:disabled,
.native-link--underline-hover.is-disabled {
  text-decoration: none;
}
</style>
