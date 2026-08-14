import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useCarousel } from '../../store/useCarousel'

const ROTATE_SPEED = 0.0032

export function DragController() {
  const { gl } = useThree()
  const dragging = useRef(false)
  const lastX = useRef(0)
  const totalMove = useRef(0)

  useEffect(() => {
    const el = gl.domElement

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      lastX.current = e.clientX
      totalMove.current = 0
      useCarousel.getState().setDragging(true)
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      totalMove.current += Math.abs(dx)
      if (totalMove.current > 6) useCarousel.getState().setSuppressClick(true)
      useCarousel.getState().addDelta(-dx * ROTATE_SPEED)
    }

    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      useCarousel.getState().setDragging(false)
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
      el.style.cursor = 'grab'
      // allow the click handler (fired right after pointerup) to see the flag,
      // then clear it for the next interaction
      setTimeout(() => useCarousel.getState().setSuppressClick(false), 50)
    }

    const onWheel = (e: WheelEvent) => {
      // support trackpad / mouse wheel horizontal & vertical as horizontal scroll
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      useCarousel.getState().addDelta(delta * ROTATE_SPEED * 0.6)
    }

    el.style.cursor = 'grab'
    el.style.touchAction = 'none'
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  return null
}
