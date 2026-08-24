/** Touch device + narrow viewport = the mobile layout (plain scrolling feed
 *  instead of the WebGL horizontal slider). Computed once — good enough for
 *  a portfolio site, no need to react to viewport resizes/rotation here. */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth <= 820
  return isTouchDevice && isSmallScreen
}

/** True in Safari (desktop or mobile) — Chrome, Edge and Firefox on any OS
 *  all fail this, including Chrome/Firefox on iOS (they still report
 *  "Safari" in the UA but add their own token too, which the negative
 *  lookahead below excludes).
 *  Used to skip the site-wide fluid distortion effect (see App.tsx) on
 *  desktop Safari specifically: it drives its CSS `filter: url(#...)` by
 *  re-encoding a PNG and swapping an SVG `<feImage>` href every single
 *  frame, which forces Safari's filter compositing to re-rasterize the
 *  entire wrapped subtree that often — fine in Chrome, badly laggy in
 *  Safari once combined with the slider/list pages' own continuous
 *  animation loops. Same class of Safari-only compositing issue that
 *  already forced disabling the overlay's separate liquid warp on mobile
 *  Safari (see ProjectOverlay.tsx). */
export function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg/.test(ua)
}
