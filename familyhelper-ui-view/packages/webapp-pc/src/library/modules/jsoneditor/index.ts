import { type VimLibraryModule } from '@/library/types.ts'

import 'jsoneditor/dist/jsoneditor.min.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

function init(): void {}

function provideVisualizerSetting(): null {
  return null
}

export default vimLibraryModule
