import type { VimLibraryModule } from '@/library/types.ts'

import './global.css'
import '@dwarfeng/familyhelper-ui-component-iconfont/src/iconfont.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init() {}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
