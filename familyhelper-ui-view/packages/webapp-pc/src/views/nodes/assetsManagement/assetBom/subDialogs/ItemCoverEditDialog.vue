<template>
  <div class="item-cover-edit-dialog-container">
    <el-dialog
      v-model="watchedVisible"
      append-to-body
      destroy-on-close
      title="项目封面编辑"
      width="50%"
      top="10vh"
      :close-on-click-modal="false"
      @open="handleDialogOpen"
      @close="handleDialogClose"
    >
      <header-layout-panel v-loading="loading" apply-container-height>
        <template v-slot:header>
          <div class="header">
            <div>
              <el-button
                type="primary"
                :disabled="itemCoverTableItems.length >= itemCoverMaxSize"
                @click="handleShowImageSelectCropDialog"
              >
                上传
              </el-button>
              <el-button type="success" @click="handleItemCoverSearch"> 刷新</el-button>
            </div>
            <span>封面数量:{{ itemCoverTableItems.length }}/{{ itemCoverMaxSize }}</span>
          </div>
        </template>
        <template v-slot:default>
          <draggable-table-panel
            class="table-panel"
            v-model:items="itemCoverTableItems"
            row-key="id"
            :inspect-button-visible="false"
            :edit-button-visible="false"
            :operate-column-width="53"
            :show-contextmenu="true"
            @onItemDelete="handleItemCoverDelete"
            @onItemOrderChanged="handleItemCoverOrderChanged"
          >
            <el-table-column label="内容" width="141px" :resizable="false">
              <template v-slot:default="{ row }">
                <div class="image-wrapper">
                  <el-image
                    class="image"
                    fit="cover"
                    preview-teleported
                    :src="(row as ItemCoverTableItem).url"
                    :preview-src-list="[(row as ItemCoverTableItem).url]"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="formatted_length"
              label="大小"
              width="95px"
              show-overflow-tooltip
            />
            <el-table-column
              prop="formatted_created_date"
              label="上传日期"
              width="180px"
              show-overflow-tooltip
            />
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </draggable-table-panel>
        </template>
      </header-layout-panel>
      <template v-slot:footer>
        <div class="footer-container">
          <el-button @click="watchedVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <image-select-crop-dialog
      title="上传图片"
      v-model:visible="imageSelectCropDialogVisible"
      :loading="imageSelectCropDialogLoading"
      :output-size="0.95"
      :cropper-height="400"
      :cropper-width="680"
      :crop-box-height="360"
      :crop-box-width="640"
      :enlarge="2"
      @onConfirmed="handleItemCoverUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'

import { ElMessage } from 'element-plus'

import { type ImageSelectCropInfo } from '@/components/image/imageSelectCropDialog/types.ts'
import DraggableTablePanel from '@/components/table/draggableTablePanel/DraggableTablePanel.vue'
import ImageSelectCropDialog from '@/components/image/imageSelectCropDialog/ImageSelectEditDialog.vue'
import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'

import { useGeneralDraggableTablePanel } from '@/components/table/draggableTablePanel/composables.ts'

import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type ItemCoverInfo } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemCover.ts'
import {
  upload,
  childForItem,
  download,
  updateOrder,
  remove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemCover.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import {
  formatUnit,
  dataSizePreset,
} from '@dwarfeng/familyhelper-ui-component-util/src/util/number.ts'
import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { ElMessageBox } from 'element-plus'

defineOptions({
  name: 'ItemCoverEditDialog',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  visible: boolean
  itemId: string
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'update:visible', value: boolean): void
  (e: 'onItemCoverUpdated'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

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

// -----------------------------------------------------------显示处理-----------------------------------------------------------
function handleDialogOpen(): void {
  handleItemCoverChildForItemSearch()
}

function handleDialogClose(): void {
  itemCoverTableItems.value.forEach((item) => {
    window.URL.revokeObjectURL(item.url)
  })
  updateItemCoverTableItemsByLookup([])
}

// -----------------------------------------------------------头部面板-----------------------------------------------------------
const itemCoverMaxSize = ref<number>(6)

// -----------------------------------------------------------项目封面查询-----------------------------------------------------------
function handleItemCoverSearch(): void {
  handleItemCoverChildForItemSearch()
}

async function handleItemCoverChildForItemSearch(): Promise<void> {
  loading.value += 1
  try {
    const _itemCovers = await lookupAllToList((pagingInfo) =>
      childForItem({ long_id: props.itemId }, pagingInfo),
    )
    const _promises: Promise<ItemCoverInfoWithUrl>[] = []
    _itemCovers.forEach((_itemCover) => {
      _promises.push(
        download(_itemCover.key).then((blob) => {
          const url: string = window.URL.createObjectURL(blob)
          return {
            ..._itemCover,
            url,
          }
        }),
      )
    })
    const _itemCoverInfoWithUrls = await Promise.all(_promises)
    itemCoverTableItems.value.forEach((item) => {
      window.URL.revokeObjectURL(item.url)
    })
    updateItemCoverTableItemsByLookup(_itemCoverInfoWithUrls)
  } finally {
    loading.value -= 1
  }
}

onUnmounted(() => {
  itemCoverTableItems.value.forEach((item) => {
    window.URL.revokeObjectURL(item.url)
  })
  updateItemCoverTableItemsByLookup([])
})

// -----------------------------------------------------------项目封面表格处理-----------------------------------------------------------
type ItemCoverInfoWithUrl = ItemCoverInfo & { url: string }

type ItemCoverTableItem = {
  id: string
  url: string
  formatted_length: string
  formatted_created_date: string
  remark: string
  info: ItemCoverInfo
}

const { items: itemCoverTableItems, updateByLookup: updateItemCoverTableItemsByLookup } =
  useGeneralDraggableTablePanel<ItemCoverInfoWithUrl, ItemCoverTableItem>(itemCoverTableItemMap)

function itemCoverTableItemMap(item: ItemCoverInfoWithUrl): ItemCoverTableItem {
  return {
    id: item.key.long_id,
    url: item.url,
    formatted_length: formatUnit(item.length, dataSizePreset),
    formatted_created_date: formatTimestamp(item.created_date),
    remark: item.remark,
    info: item,
  }
}

async function handleItemCoverDelete(item: ItemCoverTableItem): Promise<void> {
  try {
    await ElMessageBox.confirm('此操作将永久删除此项目封面。<br>是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      dangerouslyUseHTMLString: true,
      customClass: 'custom-message-box__w500',
      type: 'warning',
    })
  } catch {
    return
  }
  loading.value += 1
  try {
    await resolveResponse(remove(item.info.key))
    ElMessage({
      showClose: true,
      message: '项目封面删除成功',
      type: 'success',
    })
    emit('onItemCoverUpdated')
    handleItemCoverSearch()
  } finally {
    loading.value -= 1
  }
}

async function handleItemCoverOrderChanged(items: ItemCoverTableItem[]): Promise<void> {
  loading.value += 1
  try {
    const _keys: LongIdKey[] = items.map((item) => item.info.key)
    await resolveResponse(updateOrder({ item_cover_keys: _keys }))
    ElMessage({
      showClose: true,
      message: '顺序调整成功',
      type: 'success',
    })
    emit('onItemCoverUpdated')
  } finally {
    loading.value -= 1
  }
}

// -----------------------------------------------------------文件选择编辑对话框-----------------------------------------------------------
const imageSelectCropDialogVisible = ref<boolean>(false)
const imageSelectCropDialogLoading = ref<number>(0)

function handleShowImageSelectCropDialog(): void {
  imageSelectCropDialogVisible.value = true
}

async function handleItemCoverUpload(info: ImageSelectCropInfo): Promise<void> {
  imageSelectCropDialogLoading.value += 1
  try {
    const formData: FormData = new FormData()
    formData.append('file', info.blob, info.name)
    await resolveResponse(upload({ long_id: props.itemId }, formData))
    ElMessage({
      showClose: true,
      message: '封面上传成功',
      type: 'success',
    })
    emit('onItemCoverUpdated')
    handleItemCoverSearch()
    imageSelectCropDialogVisible.value = false
  } finally {
    imageSelectCropDialogLoading.value -= 1
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
}

.table-panel {
  height: 500px;
}

.table-panel .image-wrapper {
  line-height: 0;
}

.table-panel .image {
  width: 100%;
  height: 67px;
}
</style>
