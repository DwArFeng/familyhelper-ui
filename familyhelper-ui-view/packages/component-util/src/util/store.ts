// noinspection JSUnusedGlobalSymbols

export interface ExecutableActionHandle<BR, ER, AR> {
  registerBeforeHook: (hook: () => Promise<BR>) => void
  registerAfterHook: (hook: (executeResult: ER) => Promise<AR>) => void
  execute: () => Promise<AR[]>
}

export class ExecutableActionHandleImpl<BR, ER, AR> implements ExecutableActionHandle<BR, ER, AR> {
  private executeFlag: boolean

  private readonly beforeHooks: (() => Promise<BR>)[]
  private readonly afterHooks: ((executeResult: ER) => Promise<AR>)[]

  private executeHandler: (beforeHookResult: BR[]) => Promise<ER>

  constructor(executeHandler: (beforeHookResult: BR[]) => Promise<ER>) {
    this.executeFlag = false
    this.beforeHooks = []
    this.afterHooks = []
    this.executeHandler = executeHandler
  }

  registerBeforeHook(hook: () => Promise<BR>): void {
    if (this.executeFlag) {
      throw new Error('不能在 execute 之后添加 beforeHook')
    }
    this.beforeHooks.push(hook)
  }

  registerAfterHook(hook: (executeResult: ER) => Promise<AR>): void {
    if (this.executeFlag) {
      throw new Error('不能在 execute 之后添加 afterHook')
    }
    this.afterHooks.push(hook)
  }

  async execute(): Promise<AR[]> {
    if (this.executeFlag) {
      throw new Error('不能重复执行 execute')
    }
    this.executeFlag = true
    const beforePromises: Promise<BR>[] = []
    for (const beforeHook of this.beforeHooks) {
      beforePromises.push(beforeHook())
    }
    return Promise.all(beforePromises)
      .then((res) => this.executeHandler(res))
      .then((res) => {
        const afterPromises: Promise<AR>[] = []
        for (const afterHook of this.afterHooks) {
          afterPromises.push(afterHook(res))
        }
        return Promise.all(afterPromises)
      })
  }
}
