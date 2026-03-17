export type ManagedBean<PT> = {
  key: string
  label: string
  disabled: boolean
  parent: ManagedBean<PT> | null
  children: ManagedBean<PT>[]
  data: PT
}
