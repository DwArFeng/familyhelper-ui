import type { VimApplicationContext } from '@/vim/types.ts'
import type { VimLibraryModule } from '@/library/types.ts'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init(ctx: VimApplicationContext): void {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    ctx.app.component(key, component)
  }
}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
