import type { DispPermissionGroup } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/permissionGroup.ts'

export type DispPermissionGroupTreeItem = DispPermissionGroup & {
  tree_node_key: string
}
