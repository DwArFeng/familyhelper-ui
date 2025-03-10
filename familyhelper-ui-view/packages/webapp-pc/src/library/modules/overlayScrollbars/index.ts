import type { VimLibraryModule } from '@/library/types.ts'

import 'overlayscrollbars/overlayscrollbars.css'

import './global.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init() {}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
