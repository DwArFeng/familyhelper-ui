<template>
  <div class="note-book-indicator-container">
    <el-input
      class="indicator loading-spinner__s24"
      v-loading="loading"
      v-model="displayValue"
      readonly
    >
      <template v-slot:prepend>
        <span>当前笔记本</span>
      </template>
      <template v-slot:append>
        <el-button-group class="button-group">
          <el-button class="button" :icon="SearchIcon" @click="handleShowDialog" />
          <el-button class="button" :icon="RefreshIcon" @click="loadUserPreference" />
        </el-button-group>
      </template>
    </el-input>
    <note-book-select-dialog
      v-model:visible="dialogVisible"
      :mode="mode"
      @onConfirmed="handleConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useUserPreference } from '@/composables/userPreference.ts'

import { Search as SearchIcon, Refresh as RefreshIcon } from '@element-plus/icons-vue'

import NoteBookSelectDialog from './subDialogs/NoteBookSelectDialog.vue'
import { type DispNoteBook } from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteBook.ts'
import {
  exists,
  inspectDisp,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/note/noteBook.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NoteBookIndicator',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  mode?: 'NOTE_MANAGEMENT' | 'DEFAULT'
}

withDefaults(defineProps<Props>(), {
  mode: 'DEFAULT',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onChanged', value: DispNoteBook | null): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------数据逻辑-----------------------------------------------------------
const noteBook = ref<DispNoteBook | null>(null)

const displayValue = computed(() => {
  if (noteBook.value === null) {
    return '（未选择笔记本）'
  }
  return noteBook.value.name
})

async function updateNoteBook(noteBookId: string): Promise<void> {
  loading.value += 1
  try {
    if (noteBookId === '') {
      noteBook.value = null
      emit('onChanged', null)
      return
    }
    const _exists: boolean = await resolveResponse(exists({ long_id: noteBookId }))
    if (!_exists) {
      noteBook.value = null
      emit('onChanged', null)
      return
    }
    const _noteBook: DispNoteBook = await resolveResponse(inspectDisp({ long_id: noteBookId }))
    noteBook.value = _noteBook
    emit('onChanged', _noteBook)
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------选择对话框-----------------------------------------------------------
const dialogVisible = ref<boolean>(false)

function handleShowDialog(): void {
  dialogVisible.value = true
}

function handleConfirmed(neoValue: DispNoteBook, setDefault: boolean): void {
  const oldValue: DispNoteBook | null = noteBook.value
  noteBook.value = neoValue
  if (oldValue !== neoValue) {
    emit('onChanged', neoValue)
  }
  if (setDefault) {
    saveUserPreference()
  }
}

// -----------------------------------------------------------用户偏好-----------------------------------------------------------
type UserPreference = {
  noteBookId: string
}

const SETTINGREPO_CATEGORY_ID = 'note.default_note_book'

const DEFAULT_USER_PREFERENCE: UserPreference = {
  noteBookId: '',
}

const { loadUserPreference, saveUserPreference } = useUserPreference<UserPreference>(
  () => SETTINGREPO_CATEGORY_ID,
  DEFAULT_USER_PREFERENCE,
  userPreferenceGetter,
  userPreferenceSetter,
)

function userPreferenceGetter(): UserPreference {
  return {
    noteBookId: noteBook.value === null ? '' : noteBook.value.key.long_id,
  }
}

function userPreferenceSetter(userPreference: UserPreference): void {
  const noteBookId: string = userPreference.noteBookId
  updateNoteBook(noteBookId)
}

onMounted(() => {
  loadUserPreference()
})
</script>

<style scoped>
.indicator {
  width: 420px;
}

/*noinspection CssUnusedSymbol*/
.indicator :deep(.el-input__inner) {
  text-align: center;
}

/*noinspection CssUnusedSymbol*/
.indicator :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.button-group .button:not(:first-child) {
  padding-left: 7px;
}

.button-group .button:not(:last-child) {
  padding-right: 7px;
}
</style>
