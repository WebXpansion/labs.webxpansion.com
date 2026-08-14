/** Touch device + narrow viewport = the mobile layout (plain scrolling feed
 *  instead of the WebGL horizontal slider). Computed once — good enough for
 *  a portfolio site, no need to react to viewport resizes/rotation here. */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth <= 820
  return isTouchDevice && isSmallScreen
}
