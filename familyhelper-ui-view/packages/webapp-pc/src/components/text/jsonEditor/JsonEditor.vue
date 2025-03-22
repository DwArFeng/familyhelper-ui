<template>
  <div class="json-editor-container">
    <div id="editor" ref="editorRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import JSONEditor from 'jsoneditor'

defineOptions({
  name: 'JsonEditor',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  modelValue: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:modelValue', value: string): void
}

const emits = defineEmits<Emits>()

// -----------------------------------------------------------编辑器处理-----------------------------------------------------------
const editorRef = ref<HTMLElement | null>()
let editor: JSONEditor | null = null
let internalChangeFlag: boolean = false

const watchHandle = watch(
  () => editorRef.value,
  (value) => {
    // 如果编辑器已经存在，则不再创建。
    if (!value) {
      return
    }

    // 创建 JSON 编辑器。
    editor = new JSONEditor(value, {
      mode: 'code', // 仅代码模式。
      history: true, // 启用历史记录（撤消/重做）。
      statusBar: false, // 禁用状态栏。
      // 当 JSON 编辑器中的文本更改时触发。
      onChangeText: (jsonString: string) => {
        // 如果是只读模式，则不触发更新。
        if (props.readonly) {
          return
        }
        // 设置内部变更标记。
        internalChangeFlag = true
        // 触发更新。
        emits('update:modelValue', jsonString)
      },
    })
    // 设置字号。
    editor.aceEditor.setFontSize('14px')
    // 设置字体。
    editor.aceEditor.setOption('fontFamily', 'Consolas, SimSun')
    // 设置初始状态。
    editor.setText(props.modelValue)
    editor.aceEditor.setReadOnly(props.readonly)
    watchHandle()
  },
)

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) {
      return
    }
    if (internalChangeFlag) {
      internalChangeFlag = false
      return
    }
    editor.setText(value)
  },
)

watch(
  () => props.readonly,
  (value) => {
    if (!editor) {
      return
    }
    editor.aceEditor.setReadOnly(value)
  },
)
</script>

<style scoped>
.json-editor-container {
  height: 100%;
  width: 100%;
}

#editor {
  height: 100%;
  width: 100%;
}

/*noinspection CssUnusedSymbol,SpellCheckingInspection*/
#editor :deep(.jsoneditor-sort) {
  display: none;
}

/*noinspection CssUnusedSymbol,SpellCheckingInspection*/
#editor :deep(.jsoneditor-transform) {
  display: none;
}

/*noinspection CssUnusedSymbol,SpellCheckingInspection*/
#editor :deep(.jsoneditor-repair) {
  display: none;
}
</style>
