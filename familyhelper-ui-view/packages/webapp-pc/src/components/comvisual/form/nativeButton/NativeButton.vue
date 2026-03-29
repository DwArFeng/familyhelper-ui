<template>
  <button
    :type="buttonType"
    class="native-btn"
    :class="rootClasses"
    :disabled="disabled"
    v-bind="passthroughAttrs"
    @click="$emit('click', $event)"
  >
    <slot name="default" />
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  name: 'NativeButton',
  inheritAttrs: false,
})

// region Props 定义

type Props = {
  /** 语义类型（对齐 Element Plus 常用类型） */
  kind?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 浅色描边风格（与 kind 组合） */
  plain?: boolean
  /** 与输入框等拼成一组时：贴右侧、左侧无圆角 */
  attachEnd?: boolean
  /** 无衬底（标题栏、树展开等） */
  bare?: boolean
  /** 近似正方形控件（如树节点展开） */
  square?: boolean
  /** 圆形大块（如卡片“+”） */
  round?: boolean
  /** 块级宽度（如下拉选项整行） */
  block?: boolean
  disabled?: boolean
  buttonType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  kind: 'default',
  size: 'default',
  plain: false,
  attachEnd: false,
  bare: false,
  square: false,
  round: false,
  block: false,
  disabled: false,
  buttonType: 'button',
})

// endregion

// region Emits 定义

defineEmits<{
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

// region 根节点 class

const rootClasses = computed(() => {
  const { class: cls } = attrs
  return [
    `native-btn--size-${props.size}`,
    `native-btn--kind-${props.kind}`,
    props.bare ? 'is-bare' : { 'is-plain': props.plain },
    {
      'is-attach-end': props.attachEnd,
      'is-square': props.square,
      'is-round': props.round,
      'is-block': props.block,
    },
    cls,
  ]
})

// endregion
</script>

<style scoped>
.native-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  text-align: center;
  vertical-align: middle;
  appearance: none;
  outline: none;
}

/*noinspection CssUnusedSymbol*/
.native-btn.is-block {
  display: flex;
  width: 100%;
  justify-content: flex-start;
}

/*noinspection CssUnusedSymbol*/
.native-btn:disabled,
.native-btn.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* region 尺寸（以 padding + 字号区分，内容用 flex 居中） */

/*noinspection CssUnusedSymbol*/
.native-btn--size-large {
  padding: 12px 19px;
  font-size: 14px;
  border-radius: 4px;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-default {
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-small {
  padding: 5px 11px;
  font-size: 12px;
  border-radius: 3px;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-small.is-square {
  padding: 0;
  min-width: 22px;
  min-height: 22px;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-default.is-round,
.native-btn--size-large.is-round {
  padding: 0;
  min-width: 66px;
  min-height: 66px;
  font-size: 40px;
  line-height: 1;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  background: #ffffff;
  color: #606266;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-default.is-round:hover:not(:disabled),
.native-btn--size-large.is-round:hover:not(:disabled) {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

/* endregion */

/* region 实心 + plain（非 bare） */

/*noinspection CssUnusedSymbol*/
.native-btn--kind-default:not(.is-plain):not(.is-bare):not(.is-round) {
  border: 1px solid #dcdfe6;
  background: #ffffff;
  color: #606266;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-default:not(.is-plain):not(.is-bare):not(.is-round):hover:not(:disabled) {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-primary:not(.is-plain):not(.is-bare):not(.is-round) {
  border: 1px solid #409eff;
  background: #409eff;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-primary:not(.is-plain):not(.is-bare):not(.is-round):hover:not(:disabled) {
  background: #66b1ff;
  border-color: #66b1ff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-success:not(.is-plain):not(.is-bare):not(.is-round) {
  border: 1px solid #67c23a;
  background: #67c23a;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-success:not(.is-plain):not(.is-bare):not(.is-round):hover:not(:disabled) {
  background: #85ce61;
  border-color: #85ce61;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-warning:not(.is-plain):not(.is-bare):not(.is-round) {
  border: 1px solid #e6a23c;
  background: #e6a23c;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-warning:not(.is-plain):not(.is-bare):not(.is-round):hover:not(:disabled) {
  background: #ebb563;
  border-color: #ebb563;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-danger:not(.is-plain):not(.is-bare):not(.is-round) {
  border: 1px solid #f56c6c;
  background: #f56c6c;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-danger:not(.is-plain):not(.is-bare):not(.is-round):hover:not(:disabled) {
  background: #f78989;
  border-color: #f78989;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-info:not(.is-plain):not(.is-bare):not(.is-round) {
  border: 1px solid #909399;
  background: #909399;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-info:not(.is-plain):not(.is-bare):not(.is-round):hover:not(:disabled) {
  background: #a6a9ad;
  border-color: #a6a9ad;
}

/* plain */

/*noinspection CssUnusedSymbol*/
.native-btn--kind-default.is-plain:not(.is-bare):not(.is-round) {
  border: 1px solid #dcdfe6;
  background: #ffffff;
  color: #606266;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-default.is-plain:not(.is-bare):not(.is-round):hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-primary.is-plain:not(.is-bare):not(.is-round) {
  border: 1px solid #b3d8ff;
  background: #ecf5ff;
  color: #409eff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-primary.is-plain:not(.is-bare):not(.is-round):hover:not(:disabled) {
  border-color: #409eff;
  background: #409eff;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-success.is-plain:not(.is-bare):not(.is-round) {
  border: 1px solid #c2e7b0;
  background: #f0f9eb;
  color: #67c23a;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-success.is-plain:not(.is-bare):not(.is-round):hover:not(:disabled) {
  border-color: #67c23a;
  background: #67c23a;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-warning.is-plain:not(.is-bare):not(.is-round) {
  border: 1px solid #f5dab1;
  background: #fdf6ec;
  color: #e6a23c;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-warning.is-plain:not(.is-bare):not(.is-round):hover:not(:disabled) {
  border-color: #e6a23c;
  background: #e6a23c;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-danger.is-plain:not(.is-bare):not(.is-round) {
  border: 1px solid #fbc4c4;
  background: #fef0f0;
  color: #f56c6c;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-danger.is-plain:not(.is-bare):not(.is-round):hover:not(:disabled) {
  border-color: #f56c6c;
  background: #f56c6c;
  color: #ffffff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-info.is-plain:not(.is-bare):not(.is-round) {
  border: 1px solid #d3d4d6;
  background: #f4f4f5;
  color: #909399;
}

/*noinspection CssUnusedSymbol*/
.native-btn--kind-info.is-plain:not(.is-bare):not(.is-round):hover:not(:disabled) {
  border-color: #909399;
  background: #909399;
  color: #ffffff;
}

/* endregion */

/* region bare（无框线底，用于标题栏、关闭、树展开等） */

/*noinspection CssUnusedSymbol*/
.native-btn.is-bare:not(.is-square):not(.modal-dialog-close) {
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  box-shadow: none;
}

/*noinspection CssUnusedSymbol*/
.native-btn.is-bare:not(.is-square):not(.modal-dialog-close):hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
}

/*noinspection CssUnusedSymbol*/
.native-btn.is-bare.native-btn--kind-danger:not(.is-square) {
  color: #c45656;
  border-color: #fbc4c4;
  background: #fef0f0;
}

/*noinspection CssUnusedSymbol*/
.native-btn.is-bare.native-btn--kind-danger:not(.is-square):hover:not(:disabled) {
  background: #fde2e2;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-small.is-bare:not(.is-square):not(.is-round) {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #c0c4cc;
  border-radius: 3px;
  background: #fff;
  color: #495060;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-small.is-bare:not(.is-square):not(.is-round):hover:not(:disabled) {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-small.is-bare.is-square {
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  background: #fff;
  color: #303133;
  min-width: 22px;
  min-height: 22px;
  padding: 0;
}

/*noinspection CssUnusedSymbol*/
.native-btn--size-small.is-bare.is-square:hover:not(:disabled) {
  background: #f5f7fa;
}

/*noinspection CssUnusedSymbol*/
.native-btn.is-bare.modal-dialog-close {
  padding: 2px 8px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: #909399;
}

/*noinspection CssUnusedSymbol*/
.native-btn.is-bare.modal-dialog-close:hover:not(:disabled) {
  color: #409eff;
  background: transparent;
}

/* endregion */

/* region 与输入组拼接 */

/*noinspection CssUnusedSymbol*/
.native-btn.is-attach-end:not(.is-bare) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* endregion */
</style>
