import type { VimLibraryModule } from '@/library/types.ts'

import 'ckeditor5/ckeditor5.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init() {}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
