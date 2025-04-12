import type { VimLibraryModule } from '@/library/types.ts'

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init() {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
