// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type InjectionKey, type Ref, type VNodeChild } from 'vue'

export type ColumnAlign = 'left' | 'center' | 'right'

export type RegisteredColumn<CT> = {
  id: number
  label: string
  prop?: string
  widthPx: Ref<number>
  minWidthPx: number
  resizable: boolean
  align: ColumnAlign
  headerClass?: string
  cellClass?: string
  renderHeader: () => VNodeChild
  renderCell: (scope: { row: CT; index: number }) => VNodeChild
}

export type PagingTableRegisterContext<CT extends Record<string, unknown>> = {
  registerColumn: (col: Omit<RegisteredColumn<CT>, 'id'>) => () => void
}

export const PAGING_TABLE_PANEL_CONTEXT_KEY: InjectionKey<
  PagingTableRegisterContext<Record<string, unknown>>
> = Symbol('vim.comvisual.pagingTablePanel.context')
