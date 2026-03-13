export type HybridBeanMap<T, CT> = {
  type: string
  beanMap: (t: T) => CT
}

export type HybridBean<T> = {
  type: string
  bean: T
}
