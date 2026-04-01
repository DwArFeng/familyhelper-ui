import { type VimLibraryModule } from '@/library/types.ts'

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizerSetting,
}

function init(): void {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
}

function provideVisualizerSetting(): null {
  return null
}

export default vimLibraryModule
