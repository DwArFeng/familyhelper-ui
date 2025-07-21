<template>
  <div class="card-panel-container" ref="rootRef">
    <overlay-scrollbars-component class="scroll-bar">
      <div class="card-container">
        <el-card
          class="box-card"
          v-for="(item, index) in items"
          :key="index"
          :style="cardStyle"
          :body-style="bodyStyle"
        >
          <div
            ref="mainContainer"
            class="main-container"
            :class="isSelected(index) ? 'active' : 'inactive'"
            @click="handleCardBodyClicked(index)"
            @contextmenu="handleCardBodyContextmenuClicked(index, item, $event)"
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
                  <el-button-group class="button-group">
                    <el-button
                      class="card-button"
                      v-if="inspectButtonVisible"
                      :icon="SearchIcon"
                      @click="handleHeaderItemInspect(item, index)"
                    />
                    <el-button
                      class="card-button"
                      v-if="editButtonVisible"
                      :icon="EditPen"
                      @click="handleHeaderItemEdit(item, index)"
                    />
                    <el-button
                      class="card-button"
                      v-if="deleteButtonVisible"
                      :icon="DeleteIcon"
                      @click="handleHeaderItemDelete(item, index)"
                    />
                  </el-button-group>
                </slot>
              </div>
            </div>
            <el-divider class="divider" />
            <div class="slot-container">
              <slot name="default" :item="item" :index="index"></slot>
            </div>
          </div>
        </el-card>
        <el-card
          class="box-card"
          v-if="addButtonVisible"
          :style="cardStyle"
          :body-style="bodyStyle"
        >
          <div class="add-container">
            <el-tooltip
              effect="dark"
              content="卡片数量已经达到最大值"
              placement="top"
              :disabled="items.length < maxCard"
            >
              <div>
                <el-button
                  class="add-container-button"
                  circle
                  :icon="PlusIcon"
                  :disabled="items.length >= maxCard"
                  @click="handleAddButtonClicked"
                />
              </div>
            </el-tooltip>
          </div>
        </el-card>
      </div>
    </overlay-scrollbars-component>
    <div
      v-if="contextmenuVisible"
      ref="contextmenuRef"
      class="contextmenu"
      aria-modal="true"
      tabindex="0"
      :style="{
        left: contextmenuLeft + 'px',
        top: contextmenuTop + 'px',
        width: contextmenuWidth + 'px',
      }"
      @blur="closeMenu"
    >
      <slot
        name="contextmenu"
        :item="contextmenuItem as CT"
        :index="contextmenuIndex"
        :close="() => contextmenuClose()"
        :fireItemInspect="
          () => handleContextmenuItemInspect(contextmenuItem as CT, contextmenuIndex)
        "
        :fireItemEdit="() => handleContextmenuItemEdit(contextmenuItem as CT, contextmenuIndex)"
        :fireItemDelete="() => handleContextmenuItemDelete(contextmenuItem as CT, contextmenuIndex)"
      >
        <ul>
          <li
            v-if="inspectMenuItemVisible"
            @click="handleContextmenuItemInspect(contextmenuItem as CT, contextmenuIndex)"
          >
            查看...
          </li>
          <li
            v-if="editMenuItemVisible"
            @click="handleContextmenuItemEdit(contextmenuItem as CT, contextmenuIndex)"
          >
            编辑...
          </li>
          <li
            v-if="deleteMenuItemVisible"
            @click="handleContextmenuItemDelete(contextmenuItem as CT, contextmenuIndex)"
          >
            删除...
          </li>
        </ul>
      </slot>
    </div>
    <div v-if="contextmenuVisible" class="contextmenu-modal" />
  </div>
</template>

<script setup lang="ts" generic="CT extends Record<string, any>">
import { computed, nextTick, ref, useTemplateRef } from 'vue'

import {
  Delete as DeleteIcon,
  EditPen,
  Search as SearchIcon,
  Plus as PlusIcon,
} from '@element-plus/icons-vue'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

defineOptions({
  name: 'CardPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
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
  showContextmenu?: boolean
  contextmenuWidth?: number
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
  showContextmenu: false,
  contextmenuWidth: 85,
  inspectMenuItemVisible: true,
  editMenuItemVisible: true,
  deleteMenuItemVisible: true,
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  (e: 'onItemInspect', item: CT, index: number): void
  (e: 'onItemEdit', item: CT, index: number): void
  (e: 'onItemDelete', item: CT, index: number): void
  (e: 'onItemAdd'): void
  (e: 'onCurrentChanged', current: CT | null): void
  (e: 'onSelectionChanged', selection: CT[]): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------Slots 定义-----------------------------------------------------------
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

type ContextmenuSlotProps = {
  item: CT
  index: number
  close: () => void
  fireItemInspect: () => void
  fireItemEdit: () => void
  fireItemDelete: () => void
}

defineSlots<{
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: DefaultSlotProps) => any
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header?: (props: HeaderSlotProps) => any
  // 返回值 any 是 vue 约定的类型，故忽略类型警告。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextmenu?: (props: ContextmenuSlotProps) => any
}>()

// -----------------------------------------------------------卡片样式-----------------------------------------------------------
const bodyStyle = ref({
  width: '100%',
  height: '100%',
  display: 'flex',
  padding: '0',
})

const cardStyle = computed(() => {
  let width: number | string = props.cardWidth
  let height: number | string = props.cardHeight
  // 如果 width 或 height 是数字，则加上 px。
  if (!isNaN(Number(width))) {
    width += 'px'
  }
  if (!isNaN(Number(height))) {
    height += 'px'
  }
  // 返回结果。
  return { width, height }
})

// -----------------------------------------------------------卡片头部-----------------------------------------------------------
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

// -----------------------------------------------------------卡片选区-----------------------------------------------------------
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
      // TODO 由于没有使用需求，暂不实现。
      return
    default:
      throw new Error('不应该执行到此处, 请联系开发人员')
  }
}

// -----------------------------------------------------------卡片体-----------------------------------------------------------
function handleAddButtonClicked(): void {
  emit('onItemAdd')
}

// -----------------------------------------------------------菜单逻辑-----------------------------------------------------------
const contextmenuVisible = ref<boolean>(false)
const contextmenuLeft = ref<number>(0)
const contextmenuTop = ref<number>(0)
const contextmenuIndex = ref<number>(-1)
const contextmenuItem = ref<CT | null>(null)

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const contextmenuRef = useTemplateRef<HTMLElement>('contextmenuRef')

function handleCardBodyContextmenuClicked(index: number, item: CT, event: MouseEvent): void {
  if (!rootRef.value) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  if (!props.showContextmenu) {
    return
  }

  // 阻止系统菜单弹出。
  event.preventDefault()

  contextmenuIndex.value = index
  contextmenuItem.value = item

  const offsetLeft = rootRef.value.getBoundingClientRect().left // container margin left
  const { offsetWidth } = rootRef.value // container width
  const maxLeft = offsetWidth + offsetLeft - props.contextmenuWidth // left boundary
  const left = event.clientX + 15 // 15: margin right

  if (left > maxLeft) {
    contextmenuLeft.value = maxLeft
  } else {
    contextmenuLeft.value = left
  }

  contextmenuVisible.value = true

  nextTick(() => {
    if (!rootRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    if (!contextmenuRef.value) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }

    const contextmenuHeight = contextmenuRef.value.getBoundingClientRect().height
    const offsetTop = rootRef.value.getBoundingClientRect().top // container margin top
    const { offsetHeight } = rootRef.value // container height
    const maxTop = offsetHeight + offsetTop - contextmenuHeight // top boundary
    const top = event.clientY // 15: margin bottom

    if (top > maxTop) {
      contextmenuTop.value = maxTop
    } else {
      contextmenuTop.value = top
    }

    contextmenuRef.value.focus()
  })
}

function closeMenu(): void {
  contextmenuVisible.value = false
}

function contextmenuClose(): void {
  contextmenuVisible.value = false
}

function handleContextmenuItemInspect(item: CT, index: number): void {
  contextmenuClose()
  emit('onItemInspect', item, index)
}

function handleContextmenuItemEdit(item: CT, index: number): void {
  contextmenuClose()
  emit('onItemEdit', item, index)
}

function handleContextmenuItemDelete(item: CT, index: number): void {
  contextmenuClose()
  emit('onItemDelete', item, index)
}
</script>

<style scoped>
.card-panel-container {
  height: 100%;
  width: 100%;
}

.card-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.box-card {
  margin: 8px;
}

.clearfix {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px 10px;
}

.divider {
  margin: 0;
}

.slot-container {
  flex-grow: 1;
  height: 0;
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
}

.add-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-container-button {
  height: 66px;
  width: 66px;
  font-size: 40px;
}

.card-button {
  height: 28px;
  width: 28px;
  padding: 7px;
}

.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/*noinspection CssUnusedSymbol*/
.main-container.inactive {
  padding: 2px;
}

/*noinspection CssUnusedSymbol*/
.main-container.active {
  padding: 0;
  border-style: solid;
  border-width: 2px;
  border-color: #409eff;
}

.main-container:hover {
  background: rgba(0, 0, 0, 0.025);
}

.contextmenu {
  margin: 0;
  padding: 5px 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: #7f7f7f;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.contextmenu:focus {
  outline: none;
}

.contextmenu ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}

.contextmenu li:hover {
  background: #eee;
}

.contextmenu-modal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
}
</style>
