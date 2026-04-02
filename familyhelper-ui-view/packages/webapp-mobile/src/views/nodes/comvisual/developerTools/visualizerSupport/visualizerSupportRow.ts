// noinspection JSUnusedGlobalSymbols,DuplicatedCode

export type VisualizerSupportRow = {
  key: string
  name: string
  description: string
  /**
   * 与 {@link import('@/library/types.ts').VisualizerInfo.exampleDisplay} 一致；此处用 unknown 避免 JsonObject 递归导致 emit 类型过深。
   */
  exampleDisplay: unknown
}
