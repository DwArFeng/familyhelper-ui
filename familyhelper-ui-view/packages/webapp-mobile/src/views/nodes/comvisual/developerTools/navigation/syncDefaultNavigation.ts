// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import navigation from '@/navigation/index.ts'
import { type NodeInfo } from '@/navigation/types.ts'

import {
  operateInspect,
  operateRemove,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/settingNode.ts'
import {
  insertItem,
  updateNode,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/navigationNode.ts'
import { type LongIdKey } from '@dwarfeng/familyhelper-ui-component-api/src/api/subgrade/key.ts'
import { resolveResponse } from '@/util/response.ts'

import { nodeInfoFromVim, stringifyNodeInfo } from './nodeInfo.ts'
import { type NavigationSetting, stringifyNavigationSetting } from './navigationSetting.ts'

// region 根设置

function vimNavigationSettingToNavigationSetting(): NavigationSetting {
  const s = navigation.setting
  return {
    defaultNodeKey: s.defaultNodeKey,
    ezNavEnabled: s.ezNavEnabled,
    ezNavMaxActiveItem: s.ezNavMaxActiveItem,
    ezNavRestoreWhenLogin: s.ezNavRestoreWhenLogin,
  }
}

// endregion

// region 遍历顺序

/**
 * 按根序与 {@link NodeInfo.childKeys} 深度优先前置遍历，得到稳定的插入顺序。
 */
function collectNodeKeysPreOrder(
  rootKeys: readonly string[],
  infos: Readonly<Record<string, NodeInfo>>,
): string[] {
  const out: string[] = []
  function visit(k: string): void {
    out.push(k)
    const node = infos[k]
    if (!node) {
      return
    }
    for (const c of node.childKeys) {
      visit(c)
    }
  }
  for (const r of rootKeys) {
    visit(r)
  }
  return out
}

// endregion

// region 同步流程

export type SyncDefaultNavigationParams = {
  category: string
  args: string[]
  adjustLoading: (delta: number) => void
}

/**
 * 若对应 setting 节点存在则先删除，再按当前 VIM 导航元数据写入根配置并以 insertItem 重建条目树。
 */
export async function syncCustomNavigationFromVimDefaults(
  params: SyncDefaultNavigationParams,
): Promise<void> {
  const { category, args, adjustLoading } = params
  adjustLoading(1)
  try {
    const settingPresent = await resolveResponse(operateInspect({ category, args }))
    if (settingPresent !== null) {
      await resolveResponse(operateRemove({ category, args }))
    }
    const navigationSettingContent = stringifyNavigationSetting(
      vimNavigationSettingToNavigationSetting(),
    )
    await resolveResponse(
      updateNode({
        category,
        args,
        content: navigationSettingContent,
      }),
    )
    const rootKeys = navigation.nodeRootKeys()
    const infos = navigation.nodeInfos()
    const order = collectNodeKeysPreOrder(rootKeys, infos)
    const vimKeyToItemKey = new Map<string, LongIdKey>()
    for (const nodeKey of order) {
      const info = infos[nodeKey]
      if (!info) {
        continue
      }
      const parentItemKey: LongIdKey | null =
        info.parentKey === null ? null : (vimKeyToItemKey.get(info.parentKey) ?? null)
      const content = stringifyNodeInfo(nodeInfoFromVim(info))
      const insertRes = await resolveResponse(
        insertItem({
          category,
          args,
          parent_item_key: parentItemKey,
          index: info.index,
          name: info.key,
          content,
          remark: '',
        }),
      )
      vimKeyToItemKey.set(nodeKey, insertRes.item_key)
    }
  } finally {
    adjustLoading(-1)
  }
}

// endregion
