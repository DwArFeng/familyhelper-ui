import type { VimLibraryModule } from '@/library/types.ts'

import 'jsoneditor/dist/jsoneditor.min.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init() {}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
