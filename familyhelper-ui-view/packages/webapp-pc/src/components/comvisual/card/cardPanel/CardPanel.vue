<template>
  <div class="card-panel-container" ref="rootRef">
    <div class="scroll-bar">
      <div class="card-container">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="box-card native-card"
          :style="cardStyle"
        >
          <div
            class="main-container"
            :class="isSelected(index) ? 'active' : 'inactive'"
            @click="handleCardBodyClicked(index)"
          >
            <div class="clearfix">
              <div class="title">{{ parseTitle(item) }}</div>
              <div>
                <slot
                  name="header"
                  :item="item"
                  :index="index"
                  :fireItemInspect="() => handleHeaderItemInspect(item, index)"
                  :fireItemEdit="() => handleHeaderItemEdit(item, index)"
                  :fireItemDelete="() => handleHeaderItemDelete(item, index)"
                >
                  <div class="button-group">
                    <native-link
                      v-if="inspectButtonVisible"
                      size="small"
                      type="primary"
                      @click.stop="handleHeaderItemInspect(item, index)"
                    >
                      查看
                    </native-link>
                    <native-link
                      v-if="editButtonVisible"
                      size="small"
                      type="primary"
                      @click.stop="handleHeaderItemEdit(item, index)"
                    >
                      编辑
                    </native-link>
                    <native-link
                      v-if="deleteButtonVisible"
                      size="small"
                      type="danger"
                      @click.stop="handleHeaderItemDelete(item, index)"
                    >
                      删除
                    </native-link>
                  </div>
                </slot>
              </div>
            </div>
            <hr class="divider" />
            <div class="slot-container">
              <slot name="default" :item="item" :index="index" />
            </div>
          </div>
        </div>
        <div v-if="addButtonVisible" class="box-card native-card add-card" :style="cardStyle">
          <div class="add-container">
            <native-button
              round
              :disabled="items.length >= maxCard"
              :title="items.length >= maxCard ? '卡片数量已经达到最大值' : '添加'"
              @click="handleAddButtonClicked"
            >
              +
            </native-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, ref } from 'vue'

import NativeButton from '@/components/comvisual/form/nativeButton/NativeButton.vue'
import NativeLink from '@/components/comvisual/form/nativeLink/NativeLink.vue'

defineOptions({
  name: 'CardPanel',
})

// region Props 定义

type Props = {
  cardWidth?: number | string
  cardHeight?: number | string
  titleField?:
    | keyof {
        [K in keyof CT as CT[K] extends string ? K : never]: unknown
      }
    | ''
  items?: CT[]
  maxCard?: number
  inspectButtonVisible?: boolean
  editButtonVisible?: boolean
  deleteButtonVisible?: boolean
  addButtonVisible?: boolean
  selectMode?: 'NONE' | 'SINGLE' | 'MULTI'
  inspectMenuItemVisible?: boolean
  editMenuItemVisible?: boolean
  deleteMenuItemVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cardWidth: '300px',
  cardHeight: '210px',
  titleField: '',
  items: () => [],
  maxCard: 10,
  inspectButtonVisible: true,
  editButtonVisible: true,
  deleteButtonVisible: true,
  addButtonVisible: true,
  selectMode: 'NONE',
  inspectMenuItemVisible: true,
  editMenuItemVisible: true,
  deleteMenuItemVisible: true,
})

// endregion

// region Emits 定义

type Emits = {
  (e: 'onItemInspect', item: CT, index: number): void
  (e: 'onItemEdit', item: CT, index: number): void
  (e: 'onItemDelete', item: CT, index: number): void
  (e: 'onItemAdd'): void
  (e: 'onCurrentChanged', current: CT | null): void
  (e: 'onSelectionChanged', selection: CT[]): void
}

const emit = defineEmits<Emits>()

// endregion

// region Slots 定义

type DefaultSlotProps = {
  item: CT
  index: number
}

type HeaderSlotProps = {
  item: CT
  index: number
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
}

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header?: (props: HeaderSlotProps) => any
}>()

// endregion

// region 卡片样式

const cardStyle = computed(() => {
  let width: number | string = props.cardWidth
  let height: number | string = props.cardHeight
  if (!isNaN(Number(width))) {
    width += 'px'
  }
  if (!isNaN(Number(height))) {
    height += 'px'
  }
  return { width, height }
})

// endregion

// region 卡片头部

function parseTitle(item: CT): string {
  if (props.titleField === '') {
    return ''
  }
  return item[props.titleField]
}

function handleHeaderItemInspect(item: CT, index: number): void {
  emit('onItemInspect', item, index)
}

function handleHeaderItemEdit(item: CT, index: number): void {
  emit('onItemEdit', item, index)
}

function handleHeaderItemDelete(item: CT, index: number): void {
  emit('onItemDelete', item, index)
}

// endregion

// region 卡片选区

const singleSelectionIndex = ref<number>(-1)
const multiSelectionIndex = ref<number[]>([])

function isSelected(index: number): boolean {
  switch (props.selectMode) {
    case 'NONE':
      return false
    case 'SINGLE':
      return singleSelectionIndex.value === index
    case 'MULTI':
      return multiSelectionIndex.value.includes(index)
    default:
      throw new Error('不应该执行到此处, 请联系开发人员')
  }
}

function handleCardBodyClicked(index: number): void {
  switch (props.selectMode) {
    case 'NONE':
      return
    case 'SINGLE':
      if (singleSelectionIndex.value === index) {
        singleSelectionIndex.value = -1
        emit('onCurrentChanged', null)
        emit('onSelectionChanged', [])
      } else {
        singleSelectionIndex.value = index
        emit('onCurrentChanged', props.items[index])
        emit('onSelectionChanged', [props.items[index]])
      }
      return
    case 'MULTI':
      return
    default:
      throw new Error('不应该执行到此处, 请联系开发人员')
  }
}

// endregion

// region 卡片体

function handleAddButtonClicked(): void {
  emit('onItemAdd')
}

// endregion
</script>

<style scoped>
.card-panel-container {
  height: 100%;
  width: 100%;
}

.scroll-bar {
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: auto;
}

.card-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.native-card {
  margin: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.add-card .add-container {
  box-sizing: border-box;
}

.clearfix {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
}

.divider {
  margin: 0;
  border: none;
  border-top: 1px solid #ebeef5;
}

.slot-container {
  flex-grow: 1;
  height: 0;
  min-height: 0;
}

.title {
  text-align: center;
  flex-grow: 1;
  padding-right: 10px;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.button-group {
  display: flex;
  gap: 4px;
}

.add-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.main-container.inactive {
  padding: 2px;
}

.main-container.active {
  padding: 0;
  border-style: solid;
  border-width: 2px;
  border-color: #409eff;
  border-radius: 2px;
}

.main-container:hover {
  background: rgba(0, 0, 0, 0.025);
}
</style>
