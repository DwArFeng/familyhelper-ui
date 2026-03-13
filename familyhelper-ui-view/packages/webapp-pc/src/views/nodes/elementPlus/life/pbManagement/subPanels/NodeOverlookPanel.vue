<template>
  <div class="node-overlook-panel-container" v-loading="loading">
    <header-layout-panel>
      <template v-slot:header>
        <div class="header">
          <el-button type="primary" :disabled="readOnly" @click="handleShowPbNodeEditDialog"
            >编辑属性</el-button
          >
        </div>
      </template>
      <template v-slot:default>
        <div class="overlook-wrapper">
          <title-layout-panel class="details" title="属性" bordered>
            <el-form
              class="property-form"
              label-position="left"
              label-width="80px"
              inline
              :model="formEntity"
            >
              <el-form-item label="名称" style="width: 33%">
                {{ formEntity.name }}
              </el-form-item>
              <el-form-item label="备注" style="width: 100%">
                {{ formEntity.remark }}
              </el-form-item>
            </el-form>
          </title-layout-panel>
        </div>
      </template>
    </header-layout-panel>
    <maintain-dialog
      v-model:visible="pbNodeMaintainDialogVisible"
      label-width="100px"
      edit-title="编辑节点"
      :loading="pbNodeMaintainDialogLoading"
      :mode="pbNodeMaintainDialogMode"
      :item="pbNodeMaintainDialogItem"
      :edit-rules="pbNodeMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handlePbNodeEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="pbNodeMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="pbNodeMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { ElMessage } from 'element-plus'

import HeaderLayoutPanel from '@/components/elementPlus/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/common/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import MaintainDialog from '@/components/elementPlus/dialog/maintainDialog/MaintainDialog.vue'

import { useIdentityEditOnlyMaintainDialog } from '@/components/elementPlus/dialog/maintainDialog/composables.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import {
  type DispPbNode,
  inspectDisp as inspect,
  updatePbNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/life/pbNode.ts'
import { resolveResponse } from '@/util/response.ts'

defineOptions({
  name: 'NodeOverlookPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  nodeId: string
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onNodeEdit'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------表单实体-----------------------------------------------------------
type FormEntity = {
  name: string
  remark: string
}

const formEntity = ref<FormEntity>({
  name: '',
  remark: '',
})

// -----------------------------------------------------------查询处理-----------------------------------------------------------
watch(
  () => props.nodeId,
  () => {
    updateView()
  },
)

function updateView(): void {
  if (props.nodeId === '') {
    return
  }
  inspectNode()
}

async function inspectNode(): Promise<void> {
  loading.value += 1
  try {
    const res = await resolveResponse(inspect({ long_id: props.nodeId }))
    updateFormView(res)
  } finally {
    loading.value -= 1
  }
}

function updateFormView(res: DispPbNode): void {
  formEntity.value.name = res.name
  formEntity.value.remark = res.remark
  pbNodeMaintainDialogItem.value = {
    long_id: res.key.long_id,
    parent_long_id: res.parent_key?.long_id ?? '',
    name: res.name,
    remark: res.remark,
  }
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handleShowPbNodeEditDialog(): void {
  showPbNodeMaintainDialog(pbNodeMaintainDialogItem.value)
}

// -----------------------------------------------------------个人最佳节点维护对话框-----------------------------------------------------------
type PbNodeMaintainDialogItem = {
  long_id: string
  parent_long_id: string
  name: string
  remark: string
}

const {
  visible: pbNodeMaintainDialogVisible,
  item: pbNodeMaintainDialogItem,
  mode: pbNodeMaintainDialogMode,
  showDialog: showPbNodeMaintainDialog,
} = useIdentityEditOnlyMaintainDialog<PbNodeMaintainDialogItem>({
  long_id: '',
  parent_long_id: '',
  name: '',
  remark: '',
})
const pbNodeMaintainDialogLoading = ref<number>(0)
const pbNodeMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
})

async function handlePbNodeEdit(item: PbNodeMaintainDialogItem): Promise<void> {
  pbNodeMaintainDialogLoading.value += 1
  try {
    const _parentKey: LongIdKey | null =
      item.parent_long_id === '' ? null : { long_id: item.parent_long_id }
    await resolveResponse(
      updatePbNode({
        key: { long_id: item.long_id },
        parent_key: _parentKey,
        name: item.name,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: '节点更新成功',
      type: 'success',
    })
    emit('onNodeEdit')
    updateView()
    pbNodeMaintainDialogVisible.value = false
  } finally {
    pbNodeMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function updateViewMethod(): void {
  updateView()
}

defineExpose({
  updateView: updateViewMethod,
})

onMounted(() => {
  updateView()
})
</script>

<style scoped>
.node-overlook-panel-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.overlook-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.overlook-wrapper .details:not(:first-child) {
  margin-top: 5px;
}

.overlook-wrapper .details:last-child {
  height: 0;
  flex-grow: 1;
}

.property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}
</style>
