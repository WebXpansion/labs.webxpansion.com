import { useEffect, useRef, type ReactNode } from 'react'
import { createRectCache } from '../rect-cache'

/**
 * Cross-browser liquid distortion.
 *
 * The Chrome-only "html-in-canvas" trick used by canvasui's <Liquid> can only
 * ever warp content in Chrome Canary behind a flag/origin trial — Safari and
 * Firefox have no such API and never will on the same timeline. To get real
 * distortion of the 3D slider *and* the DOM overlay everywhere, this takes a
 * different, much older and universally-supported route:
 *
 *   1. Run the same kind of WebGL2 fluid simulation as before, but instead of
 *      rendering a pretty color trail, encode the fluid's velocity field as a
 *      displacement map (R = x-offset, G = y-offset, neutral = 128).
 *   2. Periodically snapshot that tiny off-screen canvas to a data URL and
 *      feed it into an SVG <feImage>, feeding an <feDisplacementMap> filter.
 *   3. Apply that filter via plain CSS `filter: url(#id)` to the actual
 *      on-screen content wrapper (Three.js canvas + DOM overlay together).
 *
 * feDisplacementMap + CSS `filter: url()` is standard SVG/CSS, supported in
 * Safari and Firefox as well as Chrome — no flags, no origin trial. It can't
 * be verified against real Safari from this sandbox (only Chromium is
 * available here), so give it a look on an actual Mac/iPhone Safari once
 * deployed — the technique is solid but Safari has occasionally been fussy
 * about redrawing a live-updating <feImage>, which is why both the modern
 * `href` and the legacy `xlink:href` attribute are kept in sync below.
 */

export interface FluidDistortionOptions {
  /** Resolution of the simulation grid. */
  simResolution?: number
  /** Resolution of the displacement-map texture. */
  dyeResolution?: number
  /** How much the trail persists each frame (closer to 1 lasts longer). */
  densityDissipation?: number
  /** How much motion persists each frame (closer to 1 lasts longer). */
  velocityDissipation?: number
  /** How much pressure carries over between frames. */
  pressure?: number
  /** Pressure solver iterations. */
  pressureIterations?: number
  /** Rotational force added back into the flow. */
  curl?: number
  /** Radius of the pointer splat. */
  radius?: number
  /** Force multiplier applied on pointer movement. */
  force?: number
  /** How strongly the flow warps the content, in CSS pixels. */
  distortion?: number
  /** How many rendered frames between each SVG filter refresh (perf knob). */
  updateEveryNFrames?: number
}

const DEFAULTS: Required<FluidDistortionOptions> = {
  simResolution: 128,
  dyeResolution: 256,
  densityDissipation: 0.85,
  velocityDissipation: 1,
  pressure: 0.15,
  pressureIterations: 4,
  curl: 1.9,
  radius: 1.1,
  force: 1.1,
  distortion: 46,
  updateEveryNFrames: 2,
}

const DT = 1 / 60
const XLINK_NS = 'http://www.w3.org/1999/xlink'

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

// Only the final display pass differs from the original canvasui shader set:
// instead of painting a color trail, it writes the dye field (which, as in
// the original, stores splatted (dx, dy) directly) as a neutral-grey-centred
// displacement map that <feDisplacementMap> can read directly (R channel =
// x-offset, G channel = y-offset, 0.5 = no displacement).
const FRAG_DISPLAY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uFluid;
uniform float uScale;
void main () {
  vec2 flow = texture(uFluid, vUv).rg;
  outColor = vec4(clamp(0.5 + flow * uScale, 0.0, 1.0), 0.5, 1.0);
}`

const FRAG_SPLAT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
void main () {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture(uTarget, vUv).xyz;
  outColor = vec4(base + splat, 1.0);
}`

const FRAG_ADVECT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float uDt;
uniform float uDissipation;
void main () {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * texelSize;
  vec4 sampled = uDissipation * texture(uSource, coord);
  // Safety net: with extreme debug-panel values (curl cranked up, no
  // velocity dissipation, no pressure correction) the field can blow up to
  // Inf/NaN within seconds — once that happens every future frame stays
  // NaN forever ("no effect at all"). Clamping here keeps the sim alive and
  // self-recovering no matter how the sliders are pushed.
  outColor = any(isnan(sampled)) || any(isinf(sampled)) ? vec4(0.0, 0.0, 0.0, 1.0) : clamp(sampled, -1000.0, 1000.0);
  outColor.a = 1.0;
}`

const FRAG_CLEAR = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTexture;
uniform float uValue;
void main () {
  outColor = uValue * texture(uTexture, vUv);
}`

const FRAG_DIVERGENCE = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  outColor = vec4(div, 0.0, 0.0, 1.0);
}`

const FRAG_CURL = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  outColor = vec4(vorticity, 0.0, 0.0, 1.0);
}`

const FRAG_VORTICITY = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L)) * 0.5;
  force /= length(force) + 1.0;
  force *= uCurlStrength * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy;
  vec2 next = velocity + force * uDt;
  // Same safety net as the advect pass: strong curl + zero velocity
  // dissipation is a self-feeding loop with no damping, so left unclamped
  // it can only grow every frame until it overflows to Inf/NaN.
  outColor = any(isnan(next)) || any(isinf(next)) ? vec4(0.0, 0.0, 0.0, 1.0) : vec4(clamp(next, -1000.0, 1000.0), 0.0, 1.0);
}`

const FRAG_PRESSURE = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  outColor = vec4(pressure, 0.0, 0.0, 1.0);
}`

const FRAG_GRADIENT = `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  outColor = vec4(velocity, 0.0, 1.0);
}`

interface Target {
  fbo: WebGLFramebuffer
  texture: WebGLTexture
  width: number
  height: number
}
interface DoubleTarget {
  read: Target
  write: Target
  swap: () => void
}
interface FluidTargets {
  velocity: DoubleTarget
  dye: DoubleTarget
  divergence: Target
  curl: Target
  pressure: DoubleTarget
}

function createFluidField(canvas: HTMLCanvasElement, config: Required<FluidDistortionOptions>) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: true, // needed so toDataURL() reads a valid frame
  })
  if (!gl || gl.isContextLost()) return null
  const supportsFloatTargets = Boolean(
    gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'),
  )
  if (!supportsFloatTargets) return null
  const supportsLinear = Boolean(gl.getExtension('OES_texture_float_linear'))
  const filtering = supportsLinear ? gl.LINEAR : gl.NEAREST

  const shaders: WebGLShader[] = []
  function compile(type: number, source: string): WebGLShader {
    const shader = gl!.createShader(type)!
    gl!.shaderSource(shader, source)
    gl!.compileShader(shader)
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      console.error('FluidDistortion shader error:', gl!.getShaderInfoLog(shader))
    }
    shaders.push(shader)
    return shader
  }
  const vertexShader = compile(gl.VERTEX_SHADER, VERT)

  interface Program {
    program: WebGLProgram
    uniforms: Record<string, WebGLUniformLocation>
  }
  const programs: WebGLProgram[] = []
  function createProgram(fragSource: string): Program {
    const program = gl!.createProgram()!
    gl!.attachShader(program, vertexShader)
    gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, fragSource))
    gl!.linkProgram(program)
    programs.push(program)
    const uniforms: Record<string, WebGLUniformLocation> = {}
    const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS)
    for (let i = 0; i < count; i++) {
      const info = gl!.getActiveUniform(program, i)!
      uniforms[info.name] = gl!.getUniformLocation(program, info.name)!
    }
    return { program, uniforms }
  }

  const displayProgram = createProgram(FRAG_DISPLAY)
  const splatProgram = createProgram(FRAG_SPLAT)
  const advectProgram = createProgram(FRAG_ADVECT)
  const clearProgram = createProgram(FRAG_CLEAR)
  const divergenceProgram = createProgram(FRAG_DIVERGENCE)
  const curlProgram = createProgram(FRAG_CURL)
  const vorticityProgram = createProgram(FRAG_VORTICITY)
  const pressureProgram = createProgram(FRAG_PRESSURE)
  const gradientProgram = createProgram(FRAG_GRADIENT)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  function createTarget(size: number, internalFormat: number, format: number, filter: number): Target {
    const texture = gl!.createTexture()!
    gl!.bindTexture(gl!.TEXTURE_2D, texture)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, size, size, 0, format, gl!.HALF_FLOAT, null)
    const fbo = gl!.createFramebuffer()!
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0)
    gl!.viewport(0, 0, size, size)
    gl!.clearColor(0, 0, 0, 1)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    return { fbo, texture, width: size, height: size }
  }
  function createDoubleTarget(size: number, internalFormat: number, format: number, filter: number): DoubleTarget {
    let read = createTarget(size, internalFormat, format, filter)
    let write = createTarget(size, internalFormat, format, filter)
    return {
      get read() {
        return read
      },
      get write() {
        return write
      },
      swap() {
        const t = read
        read = write
        write = t
      },
    }
  }
  function createFluidTargets(simResolution: number, dyeResolution: number): FluidTargets {
    return {
      velocity: createDoubleTarget(simResolution, gl!.RG16F, gl!.RG, filtering),
      dye: createDoubleTarget(dyeResolution, gl!.RGBA16F, gl!.RGBA, filtering),
      divergence: createTarget(simResolution, gl!.R16F, gl!.RED, gl!.NEAREST),
      curl: createTarget(simResolution, gl!.R16F, gl!.RED, gl!.NEAREST),
      pressure: createDoubleTarget(simResolution, gl!.R16F, gl!.RED, gl!.NEAREST),
    }
  }
  let fluidTargets = createFluidTargets(config.simResolution, config.dyeResolution)

  let texelX = 0
  let texelY = 0
  function updateTexelSize() {
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    texelX = 1 / (config.simResolution * (width / (height + 400)))
    texelY = 1 / config.simResolution
  }
  function syncCanvasSize() {
    const width = Math.max(1, Math.round(canvas.clientWidth))
    const height = Math.max(1, Math.round(canvas.clientHeight))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    updateTexelSize()
  }
  syncCanvasSize()

  function blit(target: Target | null) {
    if (target) {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo)
      gl!.viewport(0, 0, target.width, target.height)
    } else {
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
      gl!.viewport(0, 0, canvas.width, canvas.height)
    }
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
  }
  function bindTexture(texture: WebGLTexture, unit: number): number {
    gl!.activeTexture(gl!.TEXTURE0 + unit)
    gl!.bindTexture(gl!.TEXTURE_2D, texture)
    return unit
  }

  function applySplat(x: number, y: number, dx: number, dy: number) {
    const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1)
    const radius = config.radius / 100
    gl!.useProgram(splatProgram.program)
    gl!.uniform1i(splatProgram.uniforms.uTarget, bindTexture(fluidTargets.velocity.read.texture, 0))
    gl!.uniform1f(splatProgram.uniforms.uAspect, aspect)
    gl!.uniform2f(splatProgram.uniforms.uPoint, x, y)
    gl!.uniform3f(splatProgram.uniforms.uColor, dx, dy, 10)
    gl!.uniform1f(splatProgram.uniforms.uRadius, radius)
    blit(fluidTargets.velocity.write)
    fluidTargets.velocity.swap()
    gl!.uniform1i(splatProgram.uniforms.uTarget, bindTexture(fluidTargets.dye.read.texture, 0))
    blit(fluidTargets.dye.write)
    fluidTargets.dye.swap()
  }

  function step(delta: number) {
    gl!.disable(gl!.BLEND)
    gl!.useProgram(curlProgram.program)
    gl!.uniform2f(curlProgram.uniforms.texelSize, texelX, texelY)
    gl!.uniform1i(curlProgram.uniforms.uVelocity, bindTexture(fluidTargets.velocity.read.texture, 0))
    blit(fluidTargets.curl)

    gl!.useProgram(vorticityProgram.program)
    gl!.uniform2f(vorticityProgram.uniforms.texelSize, texelX, texelY)
    gl!.uniform1i(vorticityProgram.uniforms.uVelocity, bindTexture(fluidTargets.velocity.read.texture, 0))
    gl!.uniform1i(vorticityProgram.uniforms.uCurl, bindTexture(fluidTargets.curl.texture, 1))
    gl!.uniform1f(vorticityProgram.uniforms.uCurlStrength, config.curl)
    gl!.uniform1f(vorticityProgram.uniforms.uDt, DT)
    blit(fluidTargets.velocity.write)
    fluidTargets.velocity.swap()

    gl!.useProgram(divergenceProgram.program)
    gl!.uniform2f(divergenceProgram.uniforms.texelSize, texelX, texelY)
    gl!.uniform1i(divergenceProgram.uniforms.uVelocity, bindTexture(fluidTargets.velocity.read.texture, 0))
    blit(fluidTargets.divergence)

    gl!.useProgram(clearProgram.program)
    gl!.uniform1i(clearProgram.uniforms.uTexture, bindTexture(fluidTargets.pressure.read.texture, 0))
    gl!.uniform1f(clearProgram.uniforms.uValue, Math.pow(config.pressure, delta * 60))
    blit(fluidTargets.pressure.write)
    fluidTargets.pressure.swap()

    gl!.useProgram(pressureProgram.program)
    gl!.uniform2f(pressureProgram.uniforms.texelSize, texelX, texelY)
    gl!.uniform1i(pressureProgram.uniforms.uDivergence, bindTexture(fluidTargets.divergence.texture, 0))
    for (let i = 0; i < config.pressureIterations; i++) {
      gl!.uniform1i(pressureProgram.uniforms.uPressure, bindTexture(fluidTargets.pressure.read.texture, 1))
      blit(fluidTargets.pressure.write)
      fluidTargets.pressure.swap()
    }

    gl!.useProgram(gradientProgram.program)
    gl!.uniform2f(gradientProgram.uniforms.texelSize, texelX, texelY)
    gl!.uniform1i(gradientProgram.uniforms.uPressure, bindTexture(fluidTargets.pressure.read.texture, 0))
    gl!.uniform1i(gradientProgram.uniforms.uVelocity, bindTexture(fluidTargets.velocity.read.texture, 1))
    blit(fluidTargets.velocity.write)
    fluidTargets.velocity.swap()

    gl!.useProgram(advectProgram.program)
    gl!.uniform2f(advectProgram.uniforms.texelSize, texelX, texelY)
    gl!.uniform1i(advectProgram.uniforms.uVelocity, bindTexture(fluidTargets.velocity.read.texture, 0))
    gl!.uniform1i(advectProgram.uniforms.uSource, bindTexture(fluidTargets.velocity.read.texture, 0))
    gl!.uniform1f(advectProgram.uniforms.uDt, DT)
    gl!.uniform1f(advectProgram.uniforms.uDissipation, Math.pow(config.velocityDissipation, delta * 60))
    blit(fluidTargets.velocity.write)
    fluidTargets.velocity.swap()

    gl!.uniform1i(advectProgram.uniforms.uVelocity, bindTexture(fluidTargets.velocity.read.texture, 0))
    gl!.uniform1i(advectProgram.uniforms.uSource, bindTexture(fluidTargets.dye.read.texture, 1))
    gl!.uniform1f(advectProgram.uniforms.uDissipation, Math.pow(config.densityDissipation, delta * 60))
    blit(fluidTargets.dye.write)
    fluidTargets.dye.swap()
  }

  function render() {
    gl!.useProgram(displayProgram.program)
    gl!.uniform1i(displayProgram.uniforms.uFluid, bindTexture(fluidTargets.dye.read.texture, 0))
    gl!.uniform1f(displayProgram.uniforms.uScale, 1 / 200)
    blit(null)
  }

  function releaseTargets(targets: FluidTargets) {
    ;[
      targets.velocity.read,
      targets.velocity.write,
      targets.dye.read,
      targets.dye.write,
      targets.pressure.read,
      targets.pressure.write,
      targets.divergence,
      targets.curl,
    ].forEach((t) => {
      gl!.deleteFramebuffer(t.fbo)
      gl!.deleteTexture(t.texture)
    })
  }

  const queued: Array<[number, number, number, number]> = []
  let raf = 0
  let lastTime = performance.now()
  let destroyed = false
  let frameCount = 0

  function frame(now: number) {
    if (destroyed) return
    const delta = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now
    while (queued.length > 0) {
      const [x, y, dx, dy] = queued.pop()!
      applySplat(x, y, dx, dy)
    }
    step(delta)
    render()
    frameCount++
    if (frameCount % config.updateEveryNFrames === 0) onFrame()
    raf = requestAnimationFrame(frame)
  }

  let onFrame: () => void = () => {}
  raf = requestAnimationFrame(frame)

  const observer = new ResizeObserver(() => syncCanvasSize())
  observer.observe(canvas)

  return {
    queueSplat(x: number, y: number, dx: number, dy: number) {
      queued.push([x, y, dx, dy])
    },
    setOnFrame(cb: () => void) {
      onFrame = cb
    },
    // Live-tune the simulation without remounting — used by the temporary
    // debug panel. Resolution changes rebuild the GPU targets; everything
    // else just mutates the config the render loop already reads from.
    setConfig(next: Partial<Required<FluidDistortionOptions>>) {
      const simResolution = next.simResolution ?? config.simResolution
      const dyeResolution = next.dyeResolution ?? config.dyeResolution
      if (simResolution !== config.simResolution || dyeResolution !== config.dyeResolution) {
        const previous = fluidTargets
        fluidTargets = createFluidTargets(simResolution, dyeResolution)
        releaseTargets(previous)
      }
      Object.assign(config, next)
      updateTexelSize()
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      programs.forEach((program) => gl!.deleteProgram(program))
      shaders.forEach((shader) => gl!.deleteShader(shader))
      gl!.deleteBuffer(quad)
    },
  }
}

export interface FluidDistortionProps extends FluidDistortionOptions {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

let filterInstanceCount = 0

export function FluidDistortion({ children, className, style, ...options }: FluidDistortionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const feImageRef = useRef<SVGFEImageElement>(null)
  const filterIdRef = useRef<string>('')
  if (!filterIdRef.current) {
    filterInstanceCount += 1
    filterIdRef.current = `liquid-distort-${filterInstanceCount}`
  }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const fieldRef = useRef<ReturnType<typeof createFluidField>>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const feImage = feImageRef.current
    if (!wrapper || !canvas || !feImage) return

    // Respect the person's OS-level preference — no forced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const config: Required<FluidDistortionOptions> = { ...DEFAULTS, ...optionsRef.current }
    const field = createFluidField(canvas, config)
    if (!field) return // no WebGL2/float support — site works fine without the effect
    fieldRef.current = field

    field.setOnFrame(() => {
      try {
        const url = canvas.toDataURL('image/png')
        feImage.setAttribute('href', url)
        feImage.setAttributeNS(XLINK_NS, 'href', url)
      } catch {
        // Canvas read failed (e.g. context loss) — just skip this update.
      }
    })

    const rectCache = createRectCache(wrapper)
    const pointers = new Map<number, { x: number; y: number }>()

    function onPointerMove(event: PointerEvent) {
      const rect = rectCache.current
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      if (px < 0 || px > rect.width || py < 0 || py > rect.height) {
        pointers.delete(event.pointerId)
        return
      }
      const previous = pointers.get(event.pointerId)
      pointers.set(event.pointerId, { x: px, y: py })
      if (!previous) return
      const dx = (px - previous.x) * config.force
      const dy = -(py - previous.y) * config.force
      field!.queueSplat(px / rect.width, 1 - py / rect.height, dx, dy)
    }
    function onPointerDown(event: PointerEvent) {
      const rect = rectCache.current
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return
      pointers.set(event.pointerId, { x, y })
      field!.queueSplat(x / rect.width, 1 - y / rect.height, 1, 1)
    }
    function onPointerLeave(event: PointerEvent) {
      pointers.delete(event.pointerId)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerLeave, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointercancel', onPointerLeave)

    return () => {
      fieldRef.current = null
      field.destroy()
      rectCache.destroy()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerLeave)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointercancel', onPointerLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push live prop changes (e.g. from the temporary debug panel) into the
  // already-running simulation instead of waiting for a remount.
  useEffect(() => {
    fieldRef.current?.setConfig(options)
  })

  const filterId = filterIdRef.current
  const distortion = options.distortion ?? DEFAULTS.distortion

  return (
    <div ref={wrapperRef} className={className} style={{ ...style, filter: `url(#${filterId})` }}>
      {children}
      {/* Off-screen: the sim canvas is never meant to be seen directly, only
          snapshotted into the SVG filter's displacement map below. */}
      <svg aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" result="map" preserveAspectRatio="none" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={distortion} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'fixed', top: 0, left: 0, width: '256px', height: '256px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
      />
    </div>
  )
}

export default FluidDistortion
