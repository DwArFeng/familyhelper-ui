<template>
  <div class="header-panel-container">
    <el-pagination
      v-model:current-page="watchedCurrentPage"
      layout="prev, pager, next, jumper"
      :total="pages"
      :page-size="1"
      :pager-count="5"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

defineOptions({
  name: 'HeaderPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  currentPage: number
  pages: number
  readonly: boolean
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:currentPage', value: number): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------逻辑处理-----------------------------------------------------------
const watchedCurrentPage = ref<number>(props.currentPage + 1)

watch(
  () => props.currentPage,
  (value) => {
    watchedCurrentPage.value = value + 1
  },
)

watch(
  () => watchedCurrentPage.value,
  (value) => {
    emit('update:currentPage', value - 1)
  },
)

onMounted(() => {
  watchedCurrentPage.value = props.currentPage + 1
})
</script>

<style scoped>
.header-panel-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  column-gap: 5px;
}
</style>
