import { create } from 'zustand'

interface CarouselState {
  rotation: number // current ring rotation (radians)
  targetRotation: number // where it's headed (with inertia)
  rotationVelocity: number // radians/frame, decays over time
  dragVelocity: number // signed, drives the wave shader, decays
  isDragging: boolean
  activeIndex: number
  suppressClick: boolean
  setDragging: (v: boolean) => void
  addDelta: (deltaRadians: number) => void
  setRotationVelocity: (v: number) => void
  tick: () => void
  setActiveIndex: (i: number) => void
  setSuppressClick: (v: boolean) => void
}

const DAMPING = 0.92
const DRAG_WAVE_DAMPING = 0.88

export const useCarousel = create<CarouselState>((set, get) => ({
  rotation: 0,
  targetRotation: 0,
  rotationVelocity: 0,
  dragVelocity: 0,
  isDragging: false,
  activeIndex: 0,
  suppressClick: false,
  setSuppressClick: (v) => set({ suppressClick: v }),
  setDragging: (v) => set({ isDragging: v }),
  addDelta: (deltaRadians) => {
    const { rotation } = get()
    set({
      rotation: rotation + deltaRadians,
      rotationVelocity: deltaRadians,
      dragVelocity: Math.max(-1, Math.min(1, deltaRadians * 18)),
    })
  },
  setRotationVelocity: (v) => set({ rotationVelocity: v }),
  tick: () => {
    const { isDragging, rotation, rotationVelocity, dragVelocity } = get()
    if (isDragging) return
    if (Math.abs(rotationVelocity) < 0.00003 && Math.abs(dragVelocity) < 0.001) return
    set({
      rotation: rotation + rotationVelocity,
      rotationVelocity: rotationVelocity * DAMPING,
      dragVelocity: dragVelocity * DRAG_WAVE_DAMPING,
    })
  },
  setActiveIndex: (i) => set({ activeIndex: i }),
}))
