<template>
  <div v-if="nodePermitted">
    <el-sub-menu :index="props.node.key" v-if="hasChild">
      <template v-slot:title>
        <el-icon>
          <menu-icon />
        </el-icon>
        <span>
          {{ props.node.display[visualizerKey]?.label ?? props.node.display['']?.label ?? '未知' }}
        </span>
      </template>
      <template v-slot:default>
        <sidebar-item
          v-for="subNode in children.filter((f) => f.menu.shown)"
          :key="subNode.key"
          :node="subNode"
        />
      </template>
    </el-sub-menu>
    <el-menu-item :index="props.node.key" v-else>
      <el-icon>
        <menu-icon />
      </el-icon>
      <span>
        {{ props.node.display[visualizerKey]?.label ?? props.node.display['']?.label ?? '未知' }}
      </span>
    </el-menu-item>
  </div>
</template>

<script setup lang="ts">
import vim from '@/vim'

import { type NodeInfo } from '@/navigation/types.ts'
import { type NavigationStore } from '@/store/modules/navigation.ts'
import { type LnpStore } from '@/store/modules/lnp.ts'

import { computed } from 'vue'

import { Menu as MenuIcon } from '@element-plus/icons-vue'

// region Router 引入

const router = vim.ctx().router().vueRouter()

// endregion

// region Store 引入

const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')
const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

// endregion

// region Props 定义

type Props = {
  node: NodeInfo
}

const props = defineProps<Props>()

// endregion

// region 可视化键处理

const visualizerKey = computed<string>(
  () => (router.currentRoute.value.meta.visualizerKey as string) ?? '',
)

// endregion

// region 主节点处理

const nodePermitted = computed<boolean>(() => {
  if (props.node.permission.required) {
    const mayPermissionNode: string | undefined = props.node.permission.node
    if (!mayPermissionNode) {
      return false
    }
    return lnpStore.hasPermission(mayPermissionNode)
  }
  return true
})

// endregion

// region 子节点处理

const hasChild = computed<boolean>(() => {
  return navigationStore.getChildNodeInfos(props.node.key).length > 0
})

const children = computed<Readonly<NodeInfo[]>>(() => {
  return navigationStore.getChildNodeInfos(props.node.key)
})

// endregion
</script>
