<template>
  <div class="item-info-panel-container">
    <div class="placeholder" v-if="itemId === ''">请选择项目</div>
    <div v-else class="main-container" v-loading="loading">
      <header-layout-panel>
        <template v-slot:header>
          <div class="header-container">
            <el-button type="primary" :disabled="readonly" @click="handleShowItemEditDialog">
              编辑属性
            </el-button>
            <el-button type="primary" :disabled="readonly" @click="handleShowItemCoverEditDialog">
              编辑封面
            </el-button>
            <el-divider direction="vertical" />
            <el-button type="success" @click="handleItemSearch">刷新数据</el-button>
            <div style="flex-grow: 1" />
            <el-button
              class="item icon-button"
              v-if="mode === 'DEFAULT'"
              type="info"
              :icon="useIconfontButtonIcon('&#xffd3;')"
              @click="handlePanelFloatyButtonClicked"
            />
          </div>
        </template>
        <template v-slot:default>
          <div class="body-container">
            <title-layout-panel
              class="property-container"
              title="属性"
              bordered
              apply-container-height
            >
              <el-form
                class="property-form"
                label-position="left"
                label-width="80px"
                inline
                :model="itemPropertyFormItem"
              >
                <el-form-item label="名称" style="width: 33%">
                  {{ itemPropertyFormItem.name }}
                </el-form-item>
                <el-form-item label="类型" style="width: 33%">
                  {{ itemPropertyFormItem.formatted_type }}
                </el-form-item>
                <el-form-item label="生命周期" style="width: 33%">
                  {{ itemPropertyFormItem.formatted_life_cycle }}
                </el-form-item>
                <el-form-item label="标签" style="width: 100%">
                  <el-tag
                    class="form-tag"
                    v-for="(label, index) in itemPropertyFormItem.formatted_labels"
                    type="info"
                    :key="index"
                  >
                    {{ label }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="创建日期" style="width: 33%">
                  {{ itemPropertyFormItem.formatted_created_date }}
                </el-form-item>
                <el-form-item label="修改日期" style="width: 33%">
                  {{ itemPropertyFormItem.formatted_modified_date }}
                </el-form-item>
                <el-form-item label="废弃日期" style="width: 33%">
                  {{ itemPropertyFormItem.formatted_scrapped_date }}
                </el-form-item>
                <el-form-item label="备注" 备注="width: 100%">
                  {{ itemPropertyFormItem.remark }}
                </el-form-item>
              </el-form>
            </title-layout-panel>
            <title-layout-panel class="property-container" title="封面" bordered>
              <div class="carousel-wrapper">
                <el-carousel
                  class="el-carousel"
                  v-if="itemCoverCarouselImageUrls.length > 0"
                  height="calc(100% - 30px)"
                  type="card"
                  :autoplay="false"
                >
                  <el-carousel-item v-for="(url, index) in itemCoverCarouselImageUrls" :key="index">
                    <el-image class="image" fit="cover" :src="url" />
                  </el-carousel-item>
                </el-carousel>
                <span class="placeholder" v-else>暂无封面，请上传</span>
              </div>
            </title-layout-panel>
          </div>
        </template>
      </header-layout-panel>
    </div>
    <maintain-dialog
      v-model:visible="itemMaintainDialogVisible"
      label-width="100px"
      create-title="编辑项目"
      :loading="itemMaintainDialogLoading"
      :mode="itemMaintainDialogMode"
      :item="itemMaintainDialogItem"
      :edit-rules="itemMaintainDialogRules"
      :close-on-click-modal="false"
      @onItemEdit="handleItemEdit"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="itemMaintainDialogItem.name" placeholder="必填" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select class="form-select" v-model="itemMaintainDialogItem.type" placeholder="请选择">
          <el-option
            v-for="item in itemTypeIndicators"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签" prop="label_string_ids">
        <el-select
          class="form-select"
          v-model="itemMaintainDialogItem.label_string_ids"
          placeholder="请选择"
          multiple
        >
          <el-option
            v-for="item in itemLabels"
            :key="item.key.string_id"
            :label="item.label"
            :value="item.key.string_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生命周期" prop="life_cycle">
        <el-select
          class="form-select"
          v-model="itemMaintainDialogItem.life_cycle"
          placeholder="请选择"
        >
          <el-option
            v-for="item in itemLifeCycleIndicator"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="itemMaintainDialogItem.remark" />
      </el-form-item>
    </maintain-dialog>
    <item-cover-edit-dialog
      v-model:visible="itemCoverEditDialogVisible"
      :item-id="itemId"
      @onItemCoverUpdated="handleItemCoverUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'

import { ElMessage } from 'element-plus'
import { type FormItemRule } from 'element-plus'

import { useIconfontButtonIcon } from '@/composables/icon.ts'

import HeaderLayoutPanel from '@/components/layout/headerLayoutPanel/HeaderLayoutPanel.vue'
import TitleLayoutPanel from '@/components/layout/titleLayoutPanel/TitleLayoutPanel.vue'
import MaintainDialog from '@/components/dialog/maintainDialog/MaintainDialog.vue'

import ItemCoverEditDialog from '@/views/nodes/assetsManagement/assetBom/subDialogs/ItemCoverEditDialog.vue'

import { type ItemLifeCycle } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'
import { inspectDisp, update } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'
import { type ItemTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemTypeIndicator.ts'
import { all as allItemTypeIndicator } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemTypeIndicator.ts'
import { type ItemLabel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import { all as allItemLabel } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import { allExists as allLabelExists } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemLabel.ts'
import {
  childForItem as itemCoverChildForItem,
  download as downloadItemCover,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/itemCover.ts'
import { resolveResponse } from '@/util/response.ts'
import { lookupAllToList } from '@/util/lookup.ts'

import { formatTimestamp } from '@dwarfeng/familyhelper-ui-component-util/src/util/timestamp.ts'
import { useIdentityEditOnlyMaintainDialog } from '@/components/dialog/maintainDialog/composables.ts'
import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type StringIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { type DispItem } from '@dwarfeng/familyhelper-ui-component-api/src/api/assets/item.ts'

defineOptions({
  name: 'ItemInfoPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  itemId: string
  readonly: boolean
  mode: 'DEFAULT' | 'FLOATY'
}

const props = defineProps<Props>()

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onItemPropertyUpdated'): void
  (e: 'onItemCoverUpdated'): void
  (e: 'onPanelFloatyButtonClicked'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------头部面板-----------------------------------------------------------
function handlePanelFloatyButtonClicked(): void {
  emit('onPanelFloatyButtonClicked')
}

// -----------------------------------------------------------加载逻辑-----------------------------------------------------------
const loading = ref<number>(0)

// -----------------------------------------------------------项目查询-----------------------------------------------------------
watch(
  () => props.itemId,
  () => {
    handleItemSearch()
  },
)

function handleItemSearch(): void {
  if (props.itemId === '') {
    return
  }
  handleItemInspectSearch()
  handleItemCoverChildForItemSearch()
  handleItemTypeIndicatorAllSearch()
  handleItemLabelAllSearch()
}

async function handleItemInspectSearch(): Promise<void> {
  loading.value += 1
  try {
    const res = await resolveResponse(inspectDisp({ long_id: props.itemId }))
    syncItemPropertyFormItem(res)
    syncItemMaintainDialogItem(res)
  } finally {
    loading.value -= 1
  }
}

function syncItemPropertyFormItem(res: DispItem): void {
  itemPropertyFormItem.value.name = res.name
  itemPropertyFormItem.value.formatted_type = res.type_indicator?.label ?? '（未知）'
  itemPropertyFormItem.value.formatted_life_cycle =
    itemLifeCycleIndicator.value.find((item) => item.key === res.life_cycle)?.label ?? '（未知）'
  itemPropertyFormItem.value.formatted_labels = res.labels.map((item) => item.label)
  itemPropertyFormItem.value.formatted_created_date = formatTimestamp(res.created_date)
  const _modified_date: number | null = res.modified_date
  if (!_modified_date) {
    itemPropertyFormItem.value.formatted_modified_date = '（无）'
  } else {
    itemPropertyFormItem.value.formatted_modified_date = formatTimestamp(_modified_date)
  }
  const _scrapped_date: number | null = res.scrapped_date
  if (!_scrapped_date) {
    itemPropertyFormItem.value.formatted_scrapped_date = '（无）'
  } else {
    itemPropertyFormItem.value.formatted_scrapped_date = formatTimestamp(_scrapped_date)
  }
  itemPropertyFormItem.value.remark = res.remark
}

function syncItemMaintainDialogItem(res: DispItem): void {
  itemMaintainDialogItem.value.long_id = res.key.long_id
  itemMaintainDialogItem.value.parent_long_id = res.parent_key?.long_id ?? ''
  itemMaintainDialogItem.value.label_string_ids = res.labels.map((item) => item.key.string_id)
  itemMaintainDialogItem.value.name = res.name
  itemMaintainDialogItem.value.type = res.type_indicator?.key.string_id ?? ''
  itemMaintainDialogItem.value.life_cycle = res.life_cycle
  itemMaintainDialogItem.value.remark = res.remark
}

async function handleItemCoverChildForItemSearch(): Promise<void> {
  loading.value += 1
  try {
    const _itemCovers = await lookupAllToList((pagingInfo) =>
      itemCoverChildForItem({ long_id: props.itemId }, pagingInfo),
    )
    const _promises: Promise<Blob>[] = []
    _itemCovers.forEach((_itemCover) => {
      _promises.push(downloadItemCover(_itemCover.key))
    })
    const _blobs = await Promise.all(_promises)
    releaseOldItemCover()
    _blobs.forEach((blob) => {
      itemCoverCarouselImageUrls.value.push(window.URL.createObjectURL(blob))
    })
  } catch {
    releaseOldItemCover()
  } finally {
    loading.value -= 1
  }
}

async function handleItemTypeIndicatorAllSearch(): Promise<void> {
  loading.value += 1
  try {
    itemTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allItemTypeIndicator(pagingInfo),
    )
  } finally {
    loading.value -= 1
  }
}

async function handleItemLabelAllSearch(): Promise<void> {
  loading.value += 1
  try {
    itemLabels.value = await lookupAllToList((pagingInfo) => allItemLabel(pagingInfo))
  } finally {
    loading.value -= 1
  }
}

onMounted(() => {
  handleItemSearch()
})

// -----------------------------------------------------------头部面板-----------------------------------------------------------
async function handleShowItemEditDialog(): Promise<void> {
  // 显示对话框。
  showItemMaintainDialog(itemMaintainDialogItem.value)
  // 重新加载类型和标签数据。
  itemMaintainDialogLoading.value += 1
  try {
    itemTypeIndicators.value = await lookupAllToList((pagingInfo) =>
      allItemTypeIndicator(pagingInfo),
    )
    itemLabels.value = await lookupAllToList((pagingInfo) => allItemLabel(pagingInfo))
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------项目生命周期指示器-----------------------------------------------------------
type ItemLifeCycleIndicator = {
  key: ItemLifeCycle
  label: string
}[]

const itemLifeCycleIndicator = ref<ItemLifeCycleIndicator>([
  { key: 0, label: '准备中' },
  { key: 1, label: '使用中' },
  { key: 2, label: '禁用中' },
  { key: 3, label: '已废弃' },
])

// -----------------------------------------------------------项目类型指示器-----------------------------------------------------------
const itemTypeIndicators = ref<ItemTypeIndicator[]>([])

// -----------------------------------------------------------项目标签-----------------------------------------------------------
const itemLabels = ref<ItemLabel[]>([])

// -----------------------------------------------------------项目属性表单-----------------------------------------------------------
type ItemPropertyFormItem = {
  name: string
  formatted_type: string
  formatted_life_cycle: string
  formatted_labels: string[]
  formatted_created_date: string
  formatted_modified_date: string
  formatted_scrapped_date: string
  remark: string
}

const itemPropertyFormItem = ref<ItemPropertyFormItem>({
  name: '',
  formatted_type: '',
  formatted_life_cycle: '',
  formatted_labels: [],
  formatted_created_date: '',
  formatted_modified_date: '',
  formatted_scrapped_date: '',
  remark: '',
})

// -----------------------------------------------------------项目封面跑马灯-----------------------------------------------------------
const itemCoverCarouselImageUrls = ref<string[]>([])

function releaseOldItemCover(): void {
  // 释放旧图片的链接，并清空旧图片链接数组。
  itemCoverCarouselImageUrls.value.forEach((url) => {
    window.URL.revokeObjectURL(url)
  })
  itemCoverCarouselImageUrls.value.splice(0, itemCoverCarouselImageUrls.value.length)
}

onUnmounted(() => {
  releaseOldItemCover()
})

// -----------------------------------------------------------项目维护对话框-----------------------------------------------------------
type ItemMaintainDialogItem = {
  long_id: string
  parent_long_id: string
  label_string_ids: string[]
  name: string
  type: string
  life_cycle: ItemLifeCycle
  remark: string
}

const {
  visible: itemMaintainDialogVisible,
  item: itemMaintainDialogItem,
  mode: itemMaintainDialogMode,
  showDialog: showItemMaintainDialog,
} = useIdentityEditOnlyMaintainDialog<ItemMaintainDialogItem>({
  long_id: '',
  parent_long_id: '',
  label_string_ids: [],
  name: '',
  type: '',
  life_cycle: 0,
  remark: '',
})
const itemMaintainDialogLoading = ref<number>(0)
const itemMaintainDialogLabelExistsValidator: FormItemRule['validator'] = (
  _rule,
  value: string[],
  callback,
) => {
  if (value.length === 0) {
    callback()
    return
  }
  const keys = value.map((key) => ({ string_id: key }))
  resolveResponse(allLabelExists(keys))
    .then((res) => {
      if (!res) {
        callback(new Error('至少一个标签不存在'))
      } else {
        callback()
      }
    })
    .catch(() => {})
}
const itemMaintainDialogRules = ref({
  name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
  label_string_ids: [{ validator: itemMaintainDialogLabelExistsValidator, trigger: 'blur' }],
  item_type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
  life_cycle: [{ required: true, message: '生命周期不能为空', trigger: 'blur' }],
})

async function handleItemEdit(item: ItemMaintainDialogItem): Promise<void> {
  itemMaintainDialogLoading.value += 1
  try {
    const _parentKey: LongIdKey | null =
      item.parent_long_id === '' ? null : { long_id: item.parent_long_id }
    const _labelKeys: StringIdKey[] = item.label_string_ids.map((key) => ({ string_id: key }))
    await resolveResponse(
      update({
        item_key: { long_id: item.long_id },
        parent_key: _parentKey,
        label_keys: _labelKeys,
        name: item.name,
        type: item.type,
        life_cycle: item.life_cycle,
        remark: item.remark,
      }),
    )
    ElMessage({
      showClose: true,
      message: `项目 ${item.name} 更新成功`,
      type: 'success',
    })
    emit('onItemPropertyUpdated')
    handleItemSearch()
    itemMaintainDialogVisible.value = false
  } finally {
    itemMaintainDialogLoading.value -= 1
  }
}

// -----------------------------------------------------------项目封面编辑对话框-----------------------------------------------------------
const itemCoverEditDialogVisible = ref<boolean>(false)
const itemCoverEditDialogUpdatedFlag = ref<boolean>(false)

watch(
  () => itemCoverEditDialogVisible.value,
  (value) => {
    if (!value && itemCoverEditDialogUpdatedFlag.value) {
      itemCoverEditDialogUpdatedFlag.value = false
      handleItemSearch()
      emit('onItemCoverUpdated')
    }
  },
)

function handleShowItemCoverEditDialog(): void {
  itemCoverEditDialogVisible.value = true
}

function handleItemCoverUpdated(): void {
  itemCoverEditDialogUpdatedFlag.value = true
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
function itemSearch(): void {
  handleItemSearch()
}

defineExpose({
  itemSearch,
})
</script>

<style scoped>
.item-info-panel-container {
  height: 100%;
  width: 100%;
  background: #ffffff;
}

.placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #bfbfbf;
  user-select: none;
}

.main-container {
  width: 100%;
  height: 100%;
}

.header-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

/*noinspection CssUnusedSymbol*/
.header-container .el-divider--vertical {
  margin: 0 8px;
}

.header-container .icon-button {
  height: 16px;
  width: 16px;
  padding: 8px;
  box-sizing: content-box;
}

.body-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.body-container .property-container:not(:first-child) {
  margin-top: 5px;
}

.body-container .property-container:last-child {
  height: 0;
  flex-grow: 1;
}

.property-container {
  width: 100%;
}

.property-container .property-form {
  display: flex;
  flex-wrap: wrap;
}

.property-container .property-form :deep(label) {
  width: 240px;
  color: #99a9bf;
  line-height: 30px;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
  width: 51%;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

/*noinspection CssUnusedSymbol*/
.property-container .property-form :deep(.el-form-item__content) {
  width: 0;
  margin-right: 5px;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 30px;
}

.property-container .form-tag:not(:first-child) {
  margin-left: 5px;
}

.property-container .form-tag {
  height: 25px;
  line-height: 23px;
}

.property-container .carousel-wrapper {
  width: 100%;
  height: 100%;
}

.property-container .carousel-wrapper .el-carousel {
  width: 100%;
  height: 100%;
}

.property-container .carousel-wrapper .el-carousel .image {
  height: 100%;
  width: 100%;
}

.form-select {
  width: 100%;
}
</style>
