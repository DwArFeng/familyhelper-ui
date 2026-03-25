// noinspection JSUnusedGlobalSymbols

export interface ExecutableActionHandle<BR, ER, AR> {
  /**
   * 注册前置钩子，在核心逻辑之前执行。
   *
   * 若在 {@link ExecutableActionHandle.execute} 之后调用会抛错。
   *
   * 优先级规则：按 `priority` 数值从小到大分批次执行；较小 `priority` 的整批全部完成后，才执行较大 `priority` 的批次。
   * 同一 `priority` 的钩子在同一批次内通过 `Promise.all` 并行执行。
   *
   * 该方法等价于 `registerBeforeHook(hook, 0)`。
   *
   * @param hook 钩子函数。
   */
  registerBeforeHook(hook: () => Promise<BR>): void

  /**
   * 注册前置钩子，在核心逻辑之前执行。
   *
   * 若在 {@link ExecutableActionHandle.execute} 之后调用会抛错。
   *
   * 优先级规则：按 priority 数值从小到大分批次执行；较小 priority 的整批全部完成后，才执行较大 priority 的批次。
   * 同一 priority 的钩子在同一批次内通过 `Promise.all` 并行执行。
   *
   * @param hook 钩子函数。
   * @param priority 优先级。
   */
  registerBeforeHook(hook: () => Promise<BR>, priority: number): void

  /**
   * 注册后置钩子，在核心逻辑之后执行，入参为核心逻辑的返回值。
   *
   * 若在 {@link ExecutableActionHandle.execute} 之后调用会抛错。
   *
   * 优先级规则：按 `priority` 数值从小到大分批次执行；较小 `priority` 的整批全部完成后，才执行较大 `priority` 的批次。
   * 同一 `priority` 的钩子在同一批次内通过 `Promise.all` 并行执行。
   *
   * 该方法等价于 `registerAfterHook(hook, 0)`。
   *
   * @param hook 钩子函数。
   */
  registerAfterHook(hook: (executeResult: ER) => Promise<AR>): void

  /**
   * 注册前置钩子，在核心逻辑之前执行。
   *
   * 若在 {@link ExecutableActionHandle.execute} 之后调用会抛错。
   *
   * 优先级规则：按 `priority` 数值从小到大分批次执行；较小 `priority` 的整批全部完成后，才执行较大 `priority` 的批次。
   * 同一 `priority` 的钩子在同一批次内通过 `Promise.all` 并行执行。
   *
   * @param hook 钩子函数。
   * @param priority 优先级。
   */
  registerAfterHook(hook: (executeResult: ER) => Promise<AR>, priority: number): void

  /**
   * 依次执行：前置钩子 → 核心逻辑 → 后置钩子。
   *
   * 前置钩子和后置钩子的优先级规则为：
   * 按 `priority` 数值从小到大分批次执行；较小 `priority` 的整批全部完成后，才执行较大 `priority` 的批次。
   * 同一 `priority` 的钩子在同一批次内通过 `Promise.all` 并行执行。
   *
   * 只可调用一次；重复调用会抛错。
   *
   * @returns 所有后置钩子结果的数组，拼接顺序与前置规则一致（先小 priority 批次，批次内为 `Promise.all` 的返回值顺序）。
   */
  execute: () => Promise<AR[]>
}

interface BeforeHookEntry<BR> {
  hook: () => Promise<BR>
  priority: number
}

interface AfterHookEntry<ER, AR> {
  hook: (executeResult: ER) => Promise<AR>
  priority: number
}

export class ExecutableActionHandleImpl<BR, ER, AR> implements ExecutableActionHandle<BR, ER, AR> {
  private executeFlag: boolean

  private readonly beforeHooks: BeforeHookEntry<BR>[]
  private readonly afterHooks: AfterHookEntry<ER, AR>[]

  private readonly executeHandler: (beforeHookResult: BR[]) => Promise<ER>

  constructor(executeHandler: (beforeHookResult: BR[]) => Promise<ER>) {
    this.executeFlag = false
    this.beforeHooks = []
    this.afterHooks = []
    this.executeHandler = executeHandler
  }

  registerBeforeHook(hook: () => Promise<BR>): void
  registerBeforeHook(hook: () => Promise<BR>, priority: number): void
  registerBeforeHook(hook: () => Promise<BR>, priority?: number): void {
    if (this.executeFlag) {
      throw new Error('不能在 execute 之后添加 beforeHook')
    }
    this.beforeHooks.push({
      hook,
      priority: priority ?? 0,
    })
  }

  registerAfterHook(hook: (executeResult: ER) => Promise<AR>): void
  registerAfterHook(hook: (executeResult: ER) => Promise<AR>, priority: number): void
  registerAfterHook(hook: (executeResult: ER) => Promise<AR>, priority?: number): void {
    if (this.executeFlag) {
      throw new Error('不能在 execute 之后添加 afterHook')
    }
    this.afterHooks.push({
      hook,
      priority: priority ?? 0,
    })
  }

  async execute(): Promise<AR[]> {
    if (this.executeFlag) {
      throw new Error('不能重复执行 execute')
    }
    this.executeFlag = true

    const beforeTiers: BeforeHookEntry<BR>[][] = this.groupByPriorityAscending(this.beforeHooks)
    const beforeResults: BR[] = []
    for (let i: number = 0; i < beforeTiers.length; i++) {
      const tier: BeforeHookEntry<BR>[] = beforeTiers[i]
      const tierResults: Awaited<BR>[] = await Promise.all(
        tier.map((e: BeforeHookEntry<BR>): Promise<BR> => e.hook()),
      )
      for (let j: number = 0; j < tierResults.length; j++) {
        beforeResults.push(tierResults[j])
      }
    }

    const executeResult: Awaited<ER> = await this.executeHandler(beforeResults)

    const afterTiers: AfterHookEntry<ER, AR>[][] = this.groupByPriorityAscending(this.afterHooks)
    const afterResults: AR[] = []
    for (let i: number = 0; i < afterTiers.length; i++) {
      const tier: AfterHookEntry<ER, AR>[] = afterTiers[i]
      const tierResults: Awaited<AR>[] = await Promise.all(
        tier.map((e: AfterHookEntry<ER, AR>): Promise<AR> => e.hook(executeResult)),
      )
      for (let j: number = 0; j < tierResults.length; j++) {
        afterResults.push(tierResults[j])
      }
    }

    return afterResults
  }

  private groupByPriorityAscending<T extends { priority: number }>(items: T[]): T[][] {
    const priorityItemsMap = new Map<number, T[]>()
    for (let i: number = 0; i < items.length; i++) {
      const item: T = items[i]
      const list: T[] = priorityItemsMap.get(item.priority) ?? []
      list.push(item)
      priorityItemsMap.set(item.priority, list)
    }
    const orderedPriorities: number[] = []
    priorityItemsMap.forEach((_value: T[], key: number): void => {
      orderedPriorities.push(key)
    })
    orderedPriorities.sort((a: number, b: number): number => a - b)
    const tiers: T[][] = []
    for (let i: number = 0; i < orderedPriorities.length; i++) {
      tiers.push(priorityItemsMap.get(orderedPriorities[i])!)
    }
    return tiers
  }
}
