<template>
  <el-dialog
    class="function-maintain-dialog-container"
    v-model="watchedVisible"
    id="dialog"
    append-to-body
    title="功能编辑"
    top="9vh"
    :close-on-click-modal="false"
  >
    <div class="dialog-container">
      <el-tabs class="tabs-panel" v-model="tabsActiveName" tab-position="left">
        <el-tab-pane name="permit" label="权限管理">
          <permit-maintain-panel :account-book-id="accountBookId" />
        </el-tab-pane>
        <el-tab-pane name="remind" label="提醒管理">
          <remind-maintain-panel :account-book-id="accountBookId" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <template v-slot:footer>
      <div class="footer-container">
        <el-button @click="watchedVisible = false"> 关闭窗口</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import PermitMaintainPanel from '@/views/nodes/financeManagement/accountBook/subPanels/PermitMaintainPanel.vue'
import RemindMaintainPanel from '@/views/nodes/financeManagement/accountBook/subPanels/RemindMaintainPanel.vue'

defineOptions({
  name: 'FunctionMaintainDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  accountBookId: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  accountBookId: '',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------可见性处理-----------------------------------------------------------
const watchedVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    watchedVisible.value = value
  },
)

watch(
  () => watchedVisible.value,
  (value) => {
    emit('update:visible', value)
  },
)

onMounted(() => {
  watchedVisible.value = props.visible
})

// -----------------------------------------------------------Tab 页-----------------------------------------------------------
type TabsActiveName = 'permit' | 'remind'

const tabsActiveName = ref<TabsActiveName>('permit')
</script>

<style scoped>
.dialog-container {
  width: 100%;
  height: 68vh;
  display: flex;
  flex-direction: column;
}

.tabs-panel {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tabs__content) {
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
.tabs-panel :deep(.el-tab-pane) {
  height: 100%;
}
</style>
