import { type VimLibraryModule } from '@/library/types.ts'

/**
 * PDF.js 库入口。
 *
 * 使用 legacy 构建以兼容尚未支持 {@link Uint8Array.prototype.toHex} 等较新 API 的浏览器；
 * 主线程与 Worker 须保持同一构建（modern / legacy）一致。
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

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
