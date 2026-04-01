import { type VimLibraryModule } from '@/library/types.ts'

import 'overlayscrollbars/overlayscrollbars.css'

import './global.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

function init(): void {}

function provideVisualizerSetting(): null {
  return null
}

export default vimLibraryModule
