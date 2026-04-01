// noinspection DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import { type VimLibraryModule } from '@/library/types.ts'

import VueCropper from 'vue-cropper'

import 'vue-cropper/dist/index.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

function init(ctx: VimApplicationContext): void {
  ctx.app.use(VueCropper)
}

function provideVisualizerSetting(): null {
  return null
}

export default vimLibraryModule
