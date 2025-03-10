export interface TreeNode<CT> {
  id: number
  loaded: boolean
  expanded: boolean
  level: number
  data: CT
  parent: TreeNode<CT> | null
  childNodes: TreeNode<CT>[]
  isLeaf: boolean
  expand: () => void
  collapse: () => void
}
