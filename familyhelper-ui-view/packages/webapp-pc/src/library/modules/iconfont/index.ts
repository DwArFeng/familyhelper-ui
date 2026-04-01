import { type VimLibraryModule } from '@/library/types.ts'

import './global.css'
import '@dwarfeng/familyhelper-ui-component-iconfont/src/iconfont.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

function init(): void {}

function provideVisualizerSetting(): null {
  return null
}

export default vimLibraryModule
