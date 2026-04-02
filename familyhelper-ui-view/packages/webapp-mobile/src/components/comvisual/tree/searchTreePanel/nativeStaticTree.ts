// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type TreeNode } from '@/components/comvisual/tree/commons/types.ts'

// region 静态树节点

export class StaticTreeNode<CT extends Record<string, unknown>> implements TreeNode<CT> {
  id: number
  loaded = true
  expanded = false
  level: number
  data: CT
  parent: StaticTreeNode<CT> | null
  childNodes: StaticTreeNode<CT>[] = []
  isLeaf: boolean
  readonly key: string

  constructor(
    id: number,
    data: CT,
    parent: StaticTreeNode<CT> | null,
    level: number,
    keyField: keyof CT,
    childNodes: StaticTreeNode<CT>[],
    isLeaf: boolean,
  ) {
    this.id = id
    this.data = data
    this.parent = parent
    this.level = level
    this.key = String(data[keyField])
    this.childNodes = childNodes
    this.isLeaf = isLeaf
    this.expand = this.expand.bind(this)
    this.collapse = this.collapse.bind(this)
  }

  expand(): void {
    if (this.isLeaf) {
      return
    }
    this.expanded = true
  }

  collapse(): void {
    this.expanded = false
  }
}

// endregion

// region 静态树存储

export type StaticTreeStoreOptions<CT extends Record<string, unknown>> = {
  keyField: keyof CT
  childrenField: keyof CT
  treeAccordion: boolean
  disabledField?: keyof CT
  onStructureChanged?: () => void
}

export class StaticTreeStore<CT extends Record<string, unknown>> {
  readonly keyField: keyof CT
  readonly childrenField: keyof CT
  readonly disabledField?: keyof CT
  private treeAccordion: boolean
  private readonly onStructureChanged?: () => void

  readonly store: { nodesMap: Record<string, TreeNode<CT>> }

  rootNodes: StaticTreeNode<CT>[] = []

  private idSeq = 0
  private nodesMap: Record<string, StaticTreeNode<CT>> = {}
  private currentKey: string | null = null

  constructor(options: StaticTreeStoreOptions<CT>) {
    this.keyField = options.keyField
    this.childrenField = options.childrenField
    this.disabledField = options.disabledField
    this.treeAccordion = options.treeAccordion
    this.onStructureChanged = options.onStructureChanged
    this.store = { nodesMap: this.nodesMap as Record<string, TreeNode<CT>> }
  }

  setTreeAccordion(value: boolean): void {
    this.treeAccordion = value
  }

  private collapseSiblings(node: StaticTreeNode<CT>): void {
    if (!this.treeAccordion) {
      return
    }
    if (!node.parent) {
      for (const s of this.rootNodes) {
        if (s.id !== node.id) {
          s.collapse()
        }
      }
      return
    }
    for (const s of node.parent.childNodes) {
      if (s.id !== node.id) {
        s.collapse()
      }
    }
  }

  private collectAllKeys(items: CT[]): Set<string> {
    const keys = new Set<string>()
    const walk = (list: CT[]): void => {
      for (const item of list) {
        keys.add(String(item[this.keyField]))
        const raw = item[this.childrenField] as CT[] | undefined
        if (Array.isArray(raw) && raw.length > 0) {
          walk(raw as CT[])
        }
      }
    }
    walk(items)
    return keys
  }

  private detachFromParent(node: StaticTreeNode<CT>): void {
    if (node.parent) {
      const idx = node.parent.childNodes.indexOf(node)
      if (idx >= 0) {
        node.parent.childNodes.splice(idx, 1)
      }
    } else {
      const idx = this.rootNodes.indexOf(node)
      if (idx >= 0) {
        this.rootNodes.splice(idx, 1)
      }
    }
    node.parent = null
  }

  private removeSubtreeFromMap(node: StaticTreeNode<CT>): void {
    for (const c of node.childNodes) {
      this.removeSubtreeFromMap(c)
    }
    delete this.nodesMap[node.key]
  }

  private createNodeSkeleton(
    item: CT,
    parent: StaticTreeNode<CT> | null,
    level: number,
    newKeys: Set<string>,
  ): StaticTreeNode<CT> {
    const rawChildren = item[this.childrenField] as CT[] | undefined
    const hasChildren = Array.isArray(rawChildren) && rawChildren.length > 0
    this.idSeq += 1
    const node = new StaticTreeNode<CT>(
      this.idSeq,
      item,
      parent,
      level,
      this.keyField,
      [],
      !hasChildren,
    )
    this.nodesMap[node.key] = node
    if (hasChildren) {
      const synced = this.syncChildList(node, [], rawChildren as CT[], level + 1, newKeys)
      for (const cn of synced) {
        cn.parent = node
      }
      node.childNodes = synced
      node.isLeaf = false
    }
    return node
  }

  /**
   * 按 key 复用已有节点并增量对齐子树，保留仍存在的节点上的 expanded 等状态。
   */
  private syncChildList(
    parent: StaticTreeNode<CT> | null,
    prevChildren: StaticTreeNode<CT>[],
    nextItems: CT[],
    level: number,
    newKeys: Set<string>,
  ): StaticTreeNode<CT>[] {
    const oldByKey = new Map<string, StaticTreeNode<CT>>()
    for (const c of prevChildren) {
      oldByKey.set(c.key, c)
    }

    const next: StaticTreeNode<CT>[] = []

    for (const item of nextItems) {
      const k = String(item[this.keyField])
      let node = oldByKey.get(k)

      if (!node) {
        const existing = this.nodesMap[k]
        if (existing) {
          this.detachFromParent(existing)
          node = existing
        }
      }

      if (!node) {
        node = this.createNodeSkeleton(item, parent, level, newKeys)
      } else {
        node.data = item
        node.parent = parent
        node.level = level
        const rawChildren = item[this.childrenField] as CT[] | undefined
        const hasChildren = Array.isArray(rawChildren) && rawChildren.length > 0
        if (hasChildren) {
          node.childNodes = this.syncChildList(
            node,
            node.childNodes,
            rawChildren as CT[],
            level + 1,
            newKeys,
          )
          node.isLeaf = false
        } else {
          for (const c of node.childNodes) {
            this.removeSubtreeFromMap(c)
          }
          node.childNodes = []
          node.isLeaf = true
          node.expanded = false
        }
      }

      next.push(node)
    }

    for (const c of prevChildren) {
      if (!next.includes(c)) {
        if (newKeys.has(c.key)) {
          this.detachFromParent(c)
        } else {
          this.removeSubtreeFromMap(c)
        }
      }
    }

    return next
  }

  setItems(items: CT[]): void {
    const newKeys = this.collectAllKeys(items)
    this.rootNodes = this.syncChildList(null, this.rootNodes, items, 1, newKeys)
    if (this.currentKey && !this.nodesMap[this.currentKey]) {
      this.currentKey = null
    }
    this.onStructureChanged?.()
  }

  toggleExpand(node: StaticTreeNode<CT>): void {
    if (node.isLeaf) {
      return
    }
    if (this.treeAccordion && !node.expanded) {
      this.collapseSiblings(node)
    }
    node.expanded = !node.expanded
    this.onStructureChanged?.()
  }

  setCurrentKey(key?: string): void {
    this.currentKey = key ?? null
    this.onStructureChanged?.()
  }

  getCurrentKey(): string | null {
    return this.currentKey
  }

  getCurrentData(): CT | null {
    if (!this.currentKey) {
      return null
    }
    const n = this.nodesMap[this.currentKey]
    return n ? n.data : null
  }

  selectNodeData(data: CT | null): void {
    if (!data) {
      this.setCurrentKey(undefined)
      return
    }
    const key = String(data[this.keyField])
    this.setCurrentKey(key)
  }

  getNode(keyOrData: string | CT): StaticTreeNode<CT> {
    const key = typeof keyOrData === 'string' ? keyOrData : String(keyOrData[this.keyField])
    const n = this.nodesMap[key]
    if (!n) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    return n
  }

  getItem(key: string): CT {
    return this.getNode(key).data
  }

  getCurrentNode(): StaticTreeNode<CT> | null {
    if (!this.currentKey) {
      return null
    }
    return this.nodesMap[this.currentKey] ?? null
  }
}

// endregion
