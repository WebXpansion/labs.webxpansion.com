/**
 * Tiny singleton bridge letting non-React modules (the Three.js slider)
 * inject synthetic "pointer" splats into the site-wide WebGL2 liquid effect
 * (see `FluidDistortion.tsx`), so the liquid ripple can be triggered by
 * something other than the real cursor — e.g. simulating a swipe over a
 * video card while it's sliding into place.
 *
 * `FluidDistortion` registers its `queueSplat` here once its fluid field is
 * created, and unregisters it on unmount. Anything importing this module can
 * then call `queueFluidSplat(...)` without needing a ref/prop threaded all
 * the way down — it's simply a no-op if the effect isn't mounted (mobile,
 * or before it's ready).
 */
export type FluidSplatFn = (xNorm: number, yNorm: number, dx: number, dy: number) => void

let splatFn: FluidSplatFn | null = null

export function registerFluidSplat(fn: FluidSplatFn | null) {
  splatFn = fn
}

export function queueFluidSplat(xNorm: number, yNorm: number, dx: number, dy: number) {
  splatFn?.(xNorm, yNorm, dx, dy)
}
