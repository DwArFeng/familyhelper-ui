// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type TreeNode } from '@/components/comvisual/tree/commons/types.ts'

// region 内部节点

export class NativeTreeNode<CT extends Record<string, unknown>> implements TreeNode<CT> {
  id: number
  loaded = false
  expanded = false
  level: number
  data: CT
  parent: NativeTreeNode<CT> | null
  childNodes: NativeTreeNode<CT>[] = []
  isLeaf: boolean
  readonly key: string

  readonly keyField: keyof CT
  readonly isLeafField: keyof CT
  readonly onExpandLoad: (node: NativeTreeNode<CT>) => void
  readonly onAccordionCollapse: (node: NativeTreeNode<CT>) => void

  constructor(
    id: number,
    data: CT,
    parent: NativeTreeNode<CT> | null,
    level: number,
    keyField: keyof CT,
    isLeafField: keyof CT,
    onExpandLoad: (node: NativeTreeNode<CT>) => void,
    onAccordionCollapse: (node: NativeTreeNode<CT>) => void,
  ) {
    this.id = id
    this.data = data
    this.parent = parent
    this.level = level
    this.keyField = keyField
    this.isLeafField = isLeafField
    this.key = String(data[keyField])
    this.isLeaf = !!data[isLeafField]
    this.onExpandLoad = onExpandLoad
    this.onAccordionCollapse = onAccordionCollapse
    this.expand = this.expand.bind(this)
    this.collapse = this.collapse.bind(this)
  }

  expand(): void {
    if (this.isLeaf) {
      return
    }
    if (!this.loaded) {
      this.onExpandLoad(this)
      return
    }
    this.expanded = true
  }

  collapse(): void {
    this.expanded = false
  }
}

// endregion

// region 懒加载树存储

export type LazyTreeStoreOptions<CT extends Record<string, unknown>> = {
  keyField: keyof CT
  labelField: keyof CT
  isLeafField: keyof CT
  treeAccordion: boolean
  loadChildHandler: (item: CT, accept: (result: CT[]) => void) => void
  onStructureChanged?: () => void
}

export class LazyTreeStore<CT extends Record<string, unknown>> {
  readonly keyField: keyof CT
  readonly labelField: keyof CT
  readonly isLeafField: keyof CT
  private readonly treeAccordion: boolean
  private readonly loadChildHandler: (item: CT, accept: (result: CT[]) => void) => void
  private readonly onStructureChanged?: () => void

  readonly store: { nodesMap: Record<string, TreeNode<CT>> }

  treeRoot: CT[] = []
  rootNodes: NativeTreeNode<CT>[] = []

  private idSeq = 0
  private nodesMap: Record<string, NativeTreeNode<CT>> = {}
  private currentKey: string | null = null

  constructor(options: LazyTreeStoreOptions<CT>) {
    this.keyField = options.keyField
    this.labelField = options.labelField
    this.isLeafField = options.isLeafField
    this.treeAccordion = options.treeAccordion
    this.loadChildHandler = options.loadChildHandler
    this.onStructureChanged = options.onStructureChanged
    this.store = { nodesMap: this.nodesMap as Record<string, TreeNode<CT>> }
  }

  // region 节点创建与注册

  private createNode(
    data: CT,
    parent: NativeTreeNode<CT> | null,
    level: number,
  ): NativeTreeNode<CT> {
    this.idSeq += 1
    const node = new NativeTreeNode<CT>(
      this.idSeq,
      data,
      parent,
      level,
      this.keyField,
      this.isLeafField,
      (n) => this.requestExpandLoad(n),
      (n) => this.collapseSiblings(n),
    )
    this.nodesMap[node.key] = node
    return node
  }

  private unregisterSubtree(node: NativeTreeNode<CT>): void {
    for (const c of node.childNodes) {
      this.unregisterSubtree(c)
    }
    delete this.nodesMap[node.key]
  }

  // endregion

  // region 展开与懒加载

  private collapseSiblings(node: NativeTreeNode<CT>): void {
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

  private requestExpandLoad(node: NativeTreeNode<CT>): void {
    this.loadChildHandler(node.data, (children: CT[]) => {
      node.loaded = true
      node.childNodes = []
      for (const c of children) {
        const cn = this.createNode(c, node, node.level + 1)
        node.childNodes.push(cn)
      }
      node.isLeaf = node.childNodes.length === 0 ? !!node.data[this.isLeafField] : false
      node.expanded = true
      this.onStructureChanged?.()
    })
  }

  /** 用户点击展开/收起 */
  toggleExpand(node: NativeTreeNode<CT>): void {
    if (node.isLeaf) {
      return
    }
    if (this.treeAccordion && !node.expanded) {
      this.collapseSiblings(node)
    }
    if (!node.loaded) {
      this.requestExpandLoad(node)
      return
    }
    node.expanded = !node.expanded
    this.onStructureChanged?.()
  }

  /** 路径/搜索等场景：展开已加载节点 */
  expandNodeIfLoaded(node: NativeTreeNode<CT>): void {
    if (node.isLeaf || !node.loaded) {
      return
    }
    node.expanded = true
    this.onStructureChanged?.()
  }

  // endregion

  // region 根与刷新

  setRootData(items: CT[]): void {
    for (const n of this.rootNodes) {
      this.unregisterSubtree(n)
    }
    this.treeRoot = [...items]
    this.rootNodes = []
    this.currentKey = null
    for (const item of items) {
      const node = this.createNode(item, null, 1)
      this.rootNodes.push(node)
    }
    this.onStructureChanged?.()
  }

  // endregion

  // region 当前节点

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
      this.setCurrentKey()
      return
    }
    const key = String(data[this.keyField])
    this.setCurrentKey(key)
  }

  // endregion

  // region 查询

  getNode(keyOrData: string | CT): NativeTreeNode<CT> {
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

  getCurrentNode(): NativeTreeNode<CT> | null {
    if (!this.currentKey) {
      return null
    }
    return this.nodesMap[this.currentKey] ?? null
  }

  // endregion

  // region 增删改（对齐 Element 树常用操作）

  appendRoot(item: CT): void {
    this.treeRoot.push(item)
    const node = this.createNode(item, null, 1)
    this.rootNodes.push(node)
    this.onStructureChanged?.()
  }

  append(parent: TreeNode<CT>, item: CT): void {
    const p = parent as NativeTreeNode<CT>
    if (!p.loaded) {
      p.loaded = true
    }
    const node = this.createNode(item, p, p.level + 1)
    p.childNodes.push(node)
    p.isLeaf = false
    this.onStructureChanged?.()
  }

  insertBefore(refNode: TreeNode<CT>, item: CT): void {
    const ref = refNode as NativeTreeNode<CT>
    const parent = ref.parent
    const node = this.createNode(item, parent, ref.level)
    if (!parent) {
      const idx = this.rootNodes.findIndex((n) => n.id === ref.id)
      if (idx < 0) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      this.rootNodes.splice(idx, 0, node)
      node.parent = null
      const ridx = this.treeRoot.findIndex((d) => String(d[this.keyField]) === ref.key)
      if (ridx >= 0) {
        this.treeRoot.splice(ridx, 0, item)
      }
    } else {
      const idx = parent.childNodes.findIndex((n) => n.id === ref.id)
      if (idx < 0) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      parent.childNodes.splice(idx, 0, node)
      node.parent = parent
    }
    this.onStructureChanged?.()
  }

  insertAfter(refNode: TreeNode<CT>, item: CT): void {
    const ref = refNode as NativeTreeNode<CT>
    const parent = ref.parent
    const node = this.createNode(item, parent, ref.level)
    if (!parent) {
      const idx = this.rootNodes.findIndex((n) => n.id === ref.id)
      if (idx < 0) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      this.rootNodes.splice(idx + 1, 0, node)
      node.parent = null
      const ridx = this.treeRoot.findIndex((d) => String(d[this.keyField]) === ref.key)
      if (ridx >= 0) {
        this.treeRoot.splice(ridx + 1, 0, item)
      }
    } else {
      const idx = parent.childNodes.findIndex((n) => n.id === ref.id)
      if (idx < 0) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      parent.childNodes.splice(idx + 1, 0, node)
      node.parent = parent
    }
    this.onStructureChanged?.()
  }

  remove(item: CT): void {
    const key = String(item[this.keyField])
    const node = this.nodesMap[key]
    if (!node) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    this.unregisterSubtree(node)
    if (!node.parent) {
      this.rootNodes = this.rootNodes.filter((n) => n.id !== node.id)
      this.treeRoot = this.treeRoot.filter((d) => String(d[this.keyField]) !== key)
    } else {
      node.parent.childNodes = node.parent.childNodes.filter((n) => n.id !== node.id)
    }
    if (this.currentKey === key) {
      this.currentKey = null
    }
    this.onStructureChanged?.()
  }

  update(item: CT): void {
    const key = String(item[this.keyField])
    const node = this.nodesMap[key]
    if (!node) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }
    node.data = item
    node.isLeaf = !!item[this.isLeafField]
    const ridx = this.treeRoot.findIndex((d) => String(d[this.keyField]) === key)
    if (ridx >= 0) {
      this.treeRoot[ridx] = item
    }
    this.onStructureChanged?.()
  }

  // endregion
}

// endregion
