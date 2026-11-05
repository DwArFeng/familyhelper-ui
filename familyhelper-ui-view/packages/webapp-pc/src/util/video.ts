// noinspection JSUnusedGlobalSymbols

const PLAY_TIMEOUT_MS = 3000
const FRAME_CALLBACK_TIMEOUT_MS = 1000
const DURATION_END_MARGIN_SECONDS = 0.001

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number
}

/**
 * 从视频画面截帧失败。
 *
 * 调用方据此决定是否改用自己的兜底画面。本模块不生成封面文件。
 */
export class VideoFrameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VideoFrameError'
  }
}

/**
 * 截帧导出参数。
 *
 * maxEdge 限制画面较长边，quality 是 JPEG 质量，timeoutMs 覆盖定位、呈现和导出的总等待时间。
 */
export type VideoFrameImageOptions = {
  readonly maxEdge: number
  readonly quality: number
  readonly timeoutMs: number
}

/**
 * 按毫秒位置截取当前视频的一帧，返回 JPEG Blob。
 *
 * 视频元素需要已经挂在文档中，并且已经具备可绘制的画面数据。
 * 只修改 currentTime 时，画布经常会截到尚未解码的黑帧，因此会先静音播放到真实画面出现，再暂停并绘制。
 *
 * @param video 已加载的视频元素，函数不负责设置地址或释放资源。
 * @param milliseconds 距离片头的毫秒数，必须是大于等于 0 的有限数。
 * @param options 导出尺寸、质量和总超时。
 */
export async function captureVideoFrameAtMilliseconds(
  video: HTMLVideoElement,
  milliseconds: number,
  options: VideoFrameImageOptions,
): Promise<Blob> {
  assertImageOptions(options)
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new VideoFrameError('截帧时间无效')
  }
  assertDrawableVideo(video)
  const deadline = new FrameDeadline(options.timeoutMs)
  const targetSeconds = resolveTargetSeconds(video.duration, milliseconds)
  await seekVideo(video, targetSeconds, deadline)
  await presentFrame(video, deadline)
  deadline.assert()
  const blob = await drawFrameBlob(video, options.maxEdge, options.quality)
  deadline.assert()
  return blob
}

/**
 * 按片长比例截取当前视频的一帧，返回 JPEG Blob。
 *
 * ratio 使用 0 到 1 的刻度，0 是片头，1 是片尾。
 * 实际定位委托给按毫秒截帧的方法。
 *
 * @param video 已加载的视频元素，函数不负责设置地址或释放资源。
 * @param ratio 片长比例，0 到 1，包含两端。
 * @param options 导出尺寸、质量和总超时。
 */
export async function captureVideoFrameAtRatio(
  video: HTMLVideoElement,
  ratio: number,
  options: VideoFrameImageOptions,
): Promise<Blob> {
  assertImageOptions(options)
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
    throw new VideoFrameError('截帧比例无效')
  }
  if (!Number.isFinite(video.duration)) {
    throw new VideoFrameError('视频时长无效')
  }
  const milliseconds = video.duration * 1000 * ratio
  return captureVideoFrameAtMilliseconds(video, milliseconds, options)
}

/**
 * 截帧总超时。
 *
 * 定位、等待真实画面和导出共用同一个截止时间，避免各步骤各自等待导致总时间失控。
 */
class FrameDeadline {
  private readonly deadlineAt: number

  constructor(timeoutMs: number) {
    this.deadlineAt = Date.now() + timeoutMs
  }

  remaining(): number {
    const left = this.deadlineAt - Date.now()
    if (left <= 0) {
      throw new VideoFrameError('等待视频截帧超时')
    }
    return left
  }

  assert(): void {
    this.remaining()
  }
}

function assertImageOptions(options: VideoFrameImageOptions): void {
  if (!Number.isFinite(options.maxEdge) || options.maxEdge <= 0) {
    throw new VideoFrameError('截帧尺寸无效')
  }
  if (!Number.isFinite(options.quality) || options.quality <= 0 || options.quality > 1) {
    throw new VideoFrameError('截帧质量无效')
  }
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new VideoFrameError('截帧超时无效')
  }
}

function assertDrawableVideo(video: HTMLVideoElement): void {
  if (!Number.isFinite(video.duration)) {
    throw new VideoFrameError('视频时长无效')
  }
  if (video.videoWidth <= 0 || video.videoHeight <= 0) {
    throw new VideoFrameError('视频尺寸无效')
  }
}

/**
 * 把毫秒换算成可定位的秒数。
 *
 * 目标被限制在片长以内。正好落在片尾时向前收 0.001 秒，否则部分浏览器不呈现最后一帧。
 */
function resolveTargetSeconds(duration: number, milliseconds: number): number {
  const requested = milliseconds / 1000
  if (duration > 0 && requested >= duration) {
    return Math.max(0, duration - DURATION_END_MARGIN_SECONDS)
  }
  return Math.min(duration, Math.max(0, requested))
}

function seekVideo(
  video: HTMLVideoElement,
  targetSeconds: number,
  deadline: FrameDeadline,
): Promise<void> {
  if (Math.abs(video.currentTime - targetSeconds) < DURATION_END_MARGIN_SECONDS) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = window.setTimeout(() => {
      finish(() => reject(new VideoFrameError('等待视频定位超时')))
    }, deadline.remaining())
    const onSeeked = () => {
      finish(resolve)
    }
    const finish = (end: () => void) => {
      if (settled) {
        return
      }
      settled = true
      window.clearTimeout(timer)
      video.removeEventListener('seeked', onSeeked)
      end()
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    try {
      video.currentTime = targetSeconds
    } catch {
      finish(() => reject(new VideoFrameError('视频定位失败')))
    }
  })
}

/**
 * 等待浏览器把当前时间点的画面真正画出来。
 *
 * 播放失败或播放等待结束时不中断截帧，继续绘制当时已经能取到的帧。
 */
async function presentFrame(video: HTMLVideoElement, deadline: FrameDeadline): Promise<void> {
  video.muted = true
  try {
    await withTimeout(video.play(), Math.min(PLAY_TIMEOUT_MS, deadline.remaining()))
  } catch {
    // 自动播放被拒绝或播放等待结束时，仍绘制当前能取到的帧。
  }
  deadline.assert()
  await waitPresentedFrame(video, Math.min(FRAME_CALLBACK_TIMEOUT_MS, deadline.remaining()))
  video.pause()
}

function waitPresentedFrame(video: HTMLVideoElement, timeoutMs: number): Promise<void> {
  const requestFrame = (video as VideoWithFrameCallback).requestVideoFrameCallback
  if (typeof requestFrame !== 'function') {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve())
    })
  }
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs)
    requestFrame.call(video, () => {
      window.clearTimeout(timer)
      resolve()
    })
  })
}

function drawFrameBlob(video: HTMLVideoElement, maxEdge: number, quality: number): Promise<Blob> {
  if (video.videoWidth <= 0 || video.videoHeight <= 0) {
    return Promise.reject(new VideoFrameError('视频尺寸无效'))
  }
  const fitted = fitSize(video.videoWidth, video.videoHeight, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = fitted.width
  canvas.height = fitted.height
  const context = canvas.getContext('2d')
  if (!context) {
    return Promise.reject(new VideoFrameError('无法创建截帧画布'))
  }
  context.drawImage(video, 0, 0, fitted.width, fitted.height)
  return canvasToJpeg(canvas, quality)
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size <= 0) {
          reject(new VideoFrameError('截帧导出失败'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      quality,
    )
  })
}

function fitSize(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const edge = Math.max(width, height)
  if (edge <= maxEdge) {
    return { width, height }
  }
  const scale = maxEdge / edge
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function withTimeout(promise: Promise<unknown>, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new VideoFrameError('等待视频播放超时'))
    }, timeoutMs)
    promise.then(
      () => {
        window.clearTimeout(timer)
        resolve()
      },
      (error: unknown) => {
        window.clearTimeout(timer)
        reject(error instanceof Error ? error : new VideoFrameError('视频播放失败'))
      },
    )
  })
}
