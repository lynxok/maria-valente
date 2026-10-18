/**
 * Framing math & transform utilities for Responsive Portada / Hero framing.
 * Models:
 * - Mobile target aspect ratio: 375 : 812 (height / width = 812 / 375)
 * - Desktop target aspect ratio: 16 : 9 (width / height = 16 / 9)
 */

export interface FrameCoord {
  cx: number // 0 to 1 (center X relative to natural image width)
  cy: number // 0 to 1 (center Y relative to natural image height)
  h: number  // height of the frame relative to natural image height (0 to 1 or >1 for expanded view)
}

// Backwards compatibility alias
export type MobileFrame = FrameCoord

export const TARGET_MOBILE_ASPECT = 375 / 812 // width / height = 0.4618
export const TARGET_DESKTOP_ASPECT = 16 / 9    // width / height = 1.7778

/**
 * Derives frame width relative to image width from h and image dimensions:
 * w_px = h_px * targetAspect
 * w = (h * imgH * targetAspect) / imgW = h * targetAspect * (imgH / imgW)
 */
export function getFrameWidthFraction(
  h: number,
  imgW: number,
  imgH: number,
  aspectRatio: number = TARGET_MOBILE_ASPECT
): number {
  if (!imgW || !imgH) return h * aspectRatio
  return h * aspectRatio * (imgH / imgW)
}

/**
 * Migration helper: converts legacy format { positionStr, zoomScale } to FrameCoord { cx, cy, h }
 */
export function migrateLegacyToFrame(
  positionStr?: string,
  zoomScale?: number,
  imgW = 1280,
  imgH = 853,
  aspectRatio: number = TARGET_MOBILE_ASPECT
): FrameCoord {
  let cx = 0.5
  let cy = 0.5

  if (positionStr) {
    const parts = positionStr.trim().split(/\s+/)
    const parseCoord = (str: string) => {
      if (str.includes('%')) return parseFloat(str) / 100
      if (str === 'center') return 0.5
      if (str === 'top' || str === 'left') return 0.15
      if (str === 'bottom' || str === 'right') return 0.85
      return 0.5
    }
    if (parts.length >= 2) {
      cx = Math.max(0, Math.min(1, parseCoord(parts[0])))
      cy = Math.max(0, Math.min(1, parseCoord(parts[1])))
    }
  }

  // zoomScale legacy: 100 is default cover.
  let h = 1.0
  if (zoomScale && zoomScale > 0) {
    // zoom > 100% means closer/smaller rectangle => h = 100 / zoom
    h = Math.max(0.15, Math.min(1.4, 100 / zoomScale))
  } else if (aspectRatio === TARGET_DESKTOP_ASPECT) {
    // For 16:9 on landscape image, h default fits width if img aspect < 16/9, or height if img aspect >= 16/9
    const imgAspect = imgW / imgH
    if (imgAspect < TARGET_DESKTOP_ASPECT) {
      // image is taller than 16:9, width touches edges when w_fraction = 1 => h = imgW / (TARGET_DESKTOP_ASPECT * imgH)
      h = Math.min(1.0, imgAspect / TARGET_DESKTOP_ASPECT)
    } else {
      h = 1.0
    }
  }

  return clampFrame({ cx, cy, h }, imgW, imgH, false, aspectRatio)
}

/**
 * Clamps frame center so rectangle doesn't exit image bounds (unless allowOverflow is true)
 */
export function clampFrame(
  frame: FrameCoord,
  imgW: number,
  imgH: number,
  allowOverflow = false,
  aspectRatio: number = TARGET_MOBILE_ASPECT
): FrameCoord {
  const w = getFrameWidthFraction(frame.h, imgW, imgH, aspectRatio)
  const halfW = w / 2
  const halfH = frame.h / 2

  let cx = frame.cx
  let cy = frame.cy

  if (!allowOverflow) {
    // If w <= 1, clamp within [halfW, 1 - halfW]
    if (w <= 1) {
      cx = Math.max(halfW, Math.min(1 - halfW, cx))
    } else {
      cx = 0.5
    }

    // If h <= 1, clamp within [halfH, 1 - halfH]
    if (frame.h <= 1) {
      cy = Math.max(halfH, Math.min(1 - halfH, cy))
    } else {
      cy = 0.5
    }
  }

  return { cx, cy, h: frame.h }
}

export interface FrameTransformResult {
  scale: number
  imgWidthPx: number
  imgHeightPx: number
  translateX: number
  translateY: number
  needsBackdrop: boolean
}

/**
 * Compute the exact CSS transform and dimensions to render the framed image
 * centered in a viewport of width viewportW and height viewportH.
 * 
 * scale = viewportH / (frame.h * imgH)
 * Image size: imgW * scale, imgH * scale
 * Image point (cx * imgW, cy * imgH) lands at (viewportW / 2, viewportH / 2)
 */
export function computeFrameTransform(
  imgW: number,
  imgH: number,
  frame: FrameCoord,
  viewportW: number,
  viewportH: number
): FrameTransformResult {
  if (!imgW || !imgH || !frame.h) {
    return {
      scale: 1,
      imgWidthPx: viewportW,
      imgHeightPx: viewportH,
      translateX: 0,
      translateY: 0,
      needsBackdrop: false
    }
  }

  // Scale needed so that frame height (frame.h * imgH) matches viewportH exactly
  const scale = viewportH / (frame.h * imgH)
  const imgWidthPx = imgW * scale
  const imgHeightPx = imgH * scale

  // Frame center in pixels within the scaled image
  const centerInImgX = frame.cx * imgWidthPx
  const centerInImgY = frame.cy * imgHeightPx

  // To center this point in viewport:
  // translateX = viewportW / 2 - centerInImgX
  // translateY = viewportH / 2 - centerInImgY
  const translateX = (viewportW / 2) - centerInImgX
  const translateY = (viewportH / 2) - centerInImgY

  // Check if frame exceeds image bounds (needs blurred backdrop)
  const leftEdge = translateX
  const rightEdge = translateX + imgWidthPx
  const topEdge = translateY
  const bottomEdge = translateY + imgHeightPx

  const needsBackdrop = (
    leftEdge > 0 ||
    rightEdge < viewportW ||
    topEdge > 0 ||
    bottomEdge < viewportH ||
    frame.h > 1
  )

  return {
    scale,
    imgWidthPx,
    imgHeightPx,
    translateX,
    translateY,
    needsBackdrop
  }
}
