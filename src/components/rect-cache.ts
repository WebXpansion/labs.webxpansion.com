// Small perf helper used by the Liquid effect: getBoundingClientRect() on
// every pointermove would force a layout read each frame, so instead we
// cache the rect and only refresh it on resize/scroll.
export interface RectCache {
  readonly current: DOMRect
  destroy: () => void
}

export function createRectCache(el: HTMLElement): RectCache {
  let rect = el.getBoundingClientRect()

  function update() {
    rect = el.getBoundingClientRect()
  }

  const resizeObserver = new ResizeObserver(update)
  resizeObserver.observe(el)
  window.addEventListener('scroll', update, { passive: true, capture: true })
  window.addEventListener('resize', update)

  return {
    get current() {
      return rect
    },
    destroy() {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    },
  }
}
