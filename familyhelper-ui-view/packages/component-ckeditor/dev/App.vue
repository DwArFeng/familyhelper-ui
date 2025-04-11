<template>
  <div id="app">
    <ckeditor v-model="content" :config="config" :editor="editorClass" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { EditorConfig } from 'ckeditor5'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'

import 'ckeditor5/ckeditor5.css'

import { FamilyhelperEditor } from '../src/familyhelperEditor'

defineOptions({
  name: 'AppComponent',
})

// -----------------------------------------------------------编辑器-----------------------------------------------------------
const content = ref('')
const config = computed<EditorConfig>(() => {
  return {
    licenseKey: 'GPL',
  }
})
const editorClass = computed(() => {
  return FamilyhelperEditor
})
</script>

<style>
@import './global.css';
</style>

<style>
#app {
  height: 100%;
  width: 100%;
}
</style>

<style scoped>
/*noinspection CssUnusedSymbol*/
:deep(.ck-editor) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/*noinspection CssUnusedSymbol*/
:deep(.ck-editor__main) {
  height: 0;
  flex-grow: 1;
  margin-bottom: 8px;
}

/*noinspection CssUnusedSymbol*/
:deep(.ck-content) {
  height: 100%;
  box-sizing: border-box;
}
</style>
