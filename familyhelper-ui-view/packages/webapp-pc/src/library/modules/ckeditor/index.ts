import { type VimLibraryModule } from '@/library/types.ts'

import 'ckeditor5/ckeditor5.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

function init(): void {}

function provideVisualizerSetting(): null {
  return null
}

export default vimLibraryModule
