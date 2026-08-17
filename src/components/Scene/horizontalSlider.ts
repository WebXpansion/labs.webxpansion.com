/**
 * Horizontal 3D slider — direct port of the WordPress "portfolio-slider"
 * theme's script.js (originally a *vertical* scroll-driven Three.js slider)
 * to a *horizontal* one. This keeps the source theme's exact scroll
 * principle: wheel input accumulates and jumps one whole slide at a time
 * once a threshold is crossed, and dragging doesn't move anything until
 * release, where a swipe past a small threshold advances one slide. That's
 * intentional — it's what keeps every card landing perfectly centred
 * instead of free-scrolling to an arbitrary in-between position.
 *
 * Same per-card curvature bend shader, rounded-corner mask, infinite
 * wraparound, hover lift and click-to-open transition as the source theme.
 *
 * Desktop only — mobile uses a plain scrolling HTML feed instead (see
 * MobileFeed.tsx) since WebGL video textures need CORS headers the video
 * host doesn't send, while a native <video> tag doesn't.
 */
import * as THREE from 'three'
import { gsap } from 'gsap'

export interface SliderProject {
  title: string
  category: string
  year: string
  /** Optional looping muted video URL. If absent, `image` (or a generated
   *  placeholder canvas) is used as a static texture instead. */
  video?: string
  image?: string
  color?: string
  accent?: string
}

export interface HorizontalSliderOptions {
  canvas: HTMLCanvasElement
  projects: SliderProject[]
  onSelect: (index: number) => void
  onActiveChange?: (index: number, project: SliderProject) => void
  getPlaceholderCanvas?: (project: SliderProject) => HTMLCanvasElement
}

export function createHorizontalSlider({
  canvas,
  projects,
  onSelect,
  onActiveChange,
  getPlaceholderCanvas,
}: HorizontalSliderOptions) {
  const totalSlides = projects.length
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth <= 820
  const isMobile = isTouchDevice && isSmallScreen
  const cardSegments = isMobile ? 18 : 40

  // Pitch between card centers along the scroll axis (X).
  const slideWidth = 14
  // Fixed render size along the scroll axis — slightly larger than the pitch
  // so neighbouring cards cascade/overlap a touch, like the source theme.
  const cardRenderWidth = 18
  const gap = 5.5
  const cycleWidth = totalSlides * (slideWidth + gap)

  // Fixed height — shorter, wider cards (more cinematic, less full-bleed).
  const cardHeight = 9.5
  const parentSize = 75 // reference constant used by the curvature formula
  const curvature = 35

  const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform float uOffset;
    uniform float uHover;
    uniform float uParentSize;
    uniform float uCurvature;

    varying vec2 vUv;
    varying float vHover;

    void main() {
      vUv = uv;
      vHover = uHover;

      vec3 pos = position;

      float globalX = pos.x + uOffset;
      float distanceFromCenter = abs(globalX / (uParentSize / 2.0));
      float bend = pow(distanceFromCenter, 2.0) * uCurvature;

      float hoverLift = uHover * (0.35 - 0.25 * abs(pos.x / (14.0 / 2.0)));

      pos.z += bend + hoverLift;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `

  const fragmentShader = /* glsl */ `
    uniform sampler2D uMap;
    uniform float uHover;
    uniform float uRadius;
    uniform float uAspect;
    uniform float uTexAspect;

    varying vec2 vUv;
    varying float vHover;

    float roundedMask(vec2 uv, float radius) {
      vec2 centered = (uv - 0.5) * vec2(uAspect, 1.0);
      vec2 halfSize = vec2(0.5 * uAspect, 0.5);
      vec2 p = abs(centered) - halfSize + radius;
      float d = length(max(p, 0.0)) - radius;
      return 1.0 - smoothstep(0.0, 0.01, d);
    }

    vec2 coverUv(vec2 uv) {
      vec2 scale = vec2(1.0);
      if (uTexAspect > uAspect) {
        scale.x = uAspect / uTexAspect;
      } else {
        scale.y = uTexAspect / uAspect;
      }
      return (uv - 0.5) * scale + 0.5;
    }

    void main() {
      vec2 uv = vUv;
      vec3 color = texture2D(uMap, coverUv(uv)).rgb;
      float alpha = roundedMask(uv, uRadius);

      color += uHover * 0.05;

      gl_FragColor = vec4(color, alpha);
    }
  `

  function makeVideoTexture(
    project: SliderProject,
    onReady: (texture: THREE.VideoTexture, video: HTMLVideoElement) => void,
    onError: () => void,
    preloadFull: boolean,
  ) {
    const video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    // Required so WebGL is allowed to read pixels off a cross-origin video —
    // but it only works if the server hosting the video actually sends
    // Access-Control-Allow-Origin. If it doesn't (e.g. plain WordPress
    // media, no CORS headers), the browser blocks the load entirely and we
    // fall back to the static bgImage below rather than showing a blank card.
    video.crossOrigin = 'anonymous'
    video.preload = preloadFull ? 'auto' : 'metadata'
    video.src = project.video!

    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    video.addEventListener('loadeddata', () => onReady(texture, video))
    video.addEventListener('error', () => {
      console.warn(
        `Vidéo bloquée ou introuvable (probablement CORS) : ${project.video} — retour sur l'image de secours.`,
      )
      onError()
    })
    video.load()
    return { texture, video }
  }

  function makeStaticTexture(project: SliderProject): { texture: THREE.Texture; aspect: number } {
    if (getPlaceholderCanvas) {
      const c = getPlaceholderCanvas(project)
      const texture = new THREE.CanvasTexture(c)
      texture.colorSpace = THREE.SRGBColorSpace
      return { texture, aspect: c.width / c.height }
    }
    const loader = new THREE.TextureLoader()
    // Same CORS requirement as the video texture — if the image host also
    // doesn't send Access-Control-Allow-Origin, this fails silently (the
    // card stays untextured) instead of throwing inside the render loop.
    loader.setCrossOrigin('anonymous')
    const texture = loader.load(project.image!, undefined, undefined, () => {
      console.warn(`Image de secours bloquée ou introuvable (probablement CORS) : ${project.image}`)
    })
    texture.colorSpace = THREE.SRGBColorSpace
    return { texture, aspect: 16 / 9 }
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)

  const group = new THREE.Group()
  scene.add(group)

  const distance = 17.5
  camera.position.set(0, 0, distance)
  camera.lookAt(0, 0, 0)

  interface CardMesh extends THREE.Mesh {
    userData: {
      index: number
      baseOffset: number
      hover: number
      video: HTMLVideoElement | null
    }
  }

  const cards: CardMesh[] = []

  projects.forEach((project, i) => {
    const geometry = new THREE.PlaneGeometry(cardRenderWidth, cardHeight, cardSegments, cardSegments)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: null },
        uTime: { value: 0 },
        uOffset: { value: 0 },
        uHover: { value: 0 },
        uParentSize: { value: parentSize },
        uCurvature: { value: curvature },
        uRadius: { value: 0.08 },
        uAspect: { value: cardRenderWidth / cardHeight },
        uTexAspect: { value: 16 / 9 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geometry, material) as unknown as CardMesh
    mesh.userData = { index: i, baseOffset: -i * (slideWidth + gap), hover: 0, video: null }
    group.add(mesh)
    cards.push(mesh)

    const useStaticFallback = () => {
      if (!project.image) return
      const { texture, aspect } = makeStaticTexture(project)
      material.uniforms.uMap.value = texture
      material.uniforms.uTexAspect.value = aspect
      mesh.userData.video = null
    }

    if (project.video) {
      // Show the (much lighter, already-cached-by-then) still image right
      // away so the card isn't blank while the video downloads, then swap
      // to the video texture once it has enough data to play.
      useStaticFallback()
      makeVideoTexture(
        project,
        (texture, video) => {
          material.uniforms.uMap.value = texture
          material.uniforms.uTexAspect.value = video.videoWidth / video.videoHeight
          mesh.userData.video = video
        },
        useStaticFallback,
        i === 0,
      )
    } else {
      useStaticFallback()
    }
  })

  /* ---------------- Infinite virtual scroll (along X) ---------------- */
  function wrapCentered(x: number, cycle: number) {
    let m = ((x % cycle) + cycle) % cycle
    if (m > cycle / 2) m -= cycle
    return m
  }

  const scrollState = { current: 0, target: 0 }
  const SCROLL_EASE = 4.4
  const SWIPE_THRESHOLD = 20
  const TOUCH_DRAG_DIRECTION = -1
  let currentSlideIndex = 0

  function goToSlide(delta: number) {
    currentSlideIndex += delta
    scrollState.target = currentSlideIndex * (slideWidth + gap)
  }

  /* ---------------- Intro auto-swipe ----------------
   * First-visit hint that the cards can be swiped/scrolled: gently glides
   * through a few slides on its own right after load, then hands control
   * back. Any real interaction (wheel, drag/click, arrow key) cancels it
   * immediately so it never fights the person's own input. */
  let introTimeline: gsap.core.Timeline | null = null
  let introCancelled = false

  function cancelIntro() {
    if (introTimeline) {
      introTimeline.kill()
      introTimeline = null
    }
    introCancelled = true
  }

  function playIntro(steps = 3) {
    if (introCancelled) return
    const tl = gsap.timeline({ delay: 0.6 })
    for (let i = 0; i < steps; i++) {
      tl.to(
        scrollState,
        {
          current: `-=${slideWidth + gap}`,
          duration: 1.3,
          ease: 'power2.inOut',
          onUpdate: () => {
            // Keep target glued to current so the per-frame lerp in the
            // render loop finds nothing left to chase — gsap's easing is
            // the only thing moving the slider during the intro.
            scrollState.target = scrollState.current
          },
          onComplete: () => {
            currentSlideIndex -= 1
          },
        },
        i === 0 ? 0 : '+=0.5',
      )
    }
    introTimeline = tl
  }

  let wheelAccum = 0
  const WHEEL_THRESHOLD = 800 // augmente pour réduire la sensibilité, diminue pour l'augmenter

  function onWheel(event: WheelEvent) {
    cancelIntro()
    const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    // Inverted: scrolling up used to move right-to-left — flip so it now
    // moves left-to-right instead (and vice versa scrolling down).
    const delta = -rawDelta
    wheelAccum += delta
    while (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
      const dir = wheelAccum > 0 ? -1 : 1
      goToSlide(dir)
      wheelAccum -= Math.sign(wheelAccum) * WHEEL_THRESHOLD
    }
  }
  window.addEventListener('wheel', onWheel, { passive: true })

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      cancelIntro()
      goToSlide(-1)
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      cancelIntro()
      goToSlide(1)
    }
  }
  window.addEventListener('keydown', onKeydown)

  /* ---------------- Pointer: drag-to-scroll, hover + click ---------------- */
  const raycaster = new THREE.Raycaster()
  const pointerNDC = new THREE.Vector2()
  let hoveredMesh: CardMesh | null = null
  let pointerDown: { x: number; y: number; t: number } | null = null

  function updatePointer(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function pickMesh(): CardMesh | null {
    raycaster.setFromCamera(pointerNDC, camera)
    const hits = raycaster.intersectObjects(cards, false)
    return hits.length ? (hits[0].object as CardMesh) : null
  }

  function onPointerMove(event: PointerEvent) {
    updatePointer(event)
    hoveredMesh = pickMesh()
    renderer.domElement.style.cursor = hoveredMesh ? 'pointer' : 'grab'
  }

  function onPointerDown(event: PointerEvent) {
    cancelIntro()
    pointerDown = { x: event.clientX, y: event.clientY, t: performance.now() }
    renderer.domElement.setPointerCapture?.(event.pointerId)
  }

  function endDrag(event: PointerEvent) {
    if (!pointerDown) return
    const dx = event.clientX - pointerDown.x
    const dy = event.clientY - pointerDown.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const elapsed = performance.now() - pointerDown.t
    pointerDown = null
    try {
      renderer.domElement.releasePointerCapture?.(event.pointerId)
    } catch {
      /* noop */
    }

    if (dist < 6 && elapsed < 400) {
      updatePointer(event)
      const mesh = pickMesh()
      if (mesh) openProject(mesh.userData.index)
      return
    }

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      const baseDir = dx < 0 ? 1 : -1
      const dir = event.pointerType === 'touch' ? baseDir * TOUCH_DRAG_DIRECTION : baseDir
      goToSlide(dir)
    }
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointerup', endDrag)
  renderer.domElement.addEventListener('pointercancel', endDrag)

  function openProject(index: number) {
    const target = cards[index]
    gsap.to(target.scale, { x: 1.06, y: 1.06, duration: 0.35, ease: 'power2.out' })
    setTimeout(() => onSelect(index), 250)
  }

  /* ---------------- Resize ---------------- */
  let resizeTimeout: ReturnType<typeof setTimeout>
  function onResize() {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }, 250)
  }
  window.addEventListener('resize', onResize)

  /* ---------------- Render loop ---------------- */
  const clock = new THREE.Clock()
  let elapsedTime = 0
  let lastVideoCheck = 0
  const ACTIVE_RANGE = slideWidth * 1.6
  let activeIndex = -1
  let rafId = 0

  function animate() {
    rafId = requestAnimationFrame(animate)
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsedTime += dt
    const t = elapsedTime

    scrollState.current += (scrollState.target - scrollState.current) * Math.min(SCROLL_EASE * dt, 1)
    if (Math.abs(scrollState.target - scrollState.current) < 0.05) {
      scrollState.current = scrollState.target
    }

    if (Math.abs(scrollState.current) > cycleWidth * 500) {
      const periods = Math.round(scrollState.current / cycleWidth)
      const shift = periods * cycleWidth
      scrollState.current -= shift
      scrollState.target -= shift
    }

    const shouldCheckVideos = t - lastVideoCheck > 0.25
    if (shouldCheckVideos) lastVideoCheck = t

    let closestIndex = 0
    let closestDist = Infinity

    cards.forEach((mesh) => {
      const x = wrapCentered(mesh.userData.baseOffset - scrollState.current, cycleWidth)

      if (Math.abs(x) < closestDist) {
        closestDist = Math.abs(x)
        closestIndex = mesh.userData.index
      }

      mesh.position.x = x

      const isHovered = mesh === hoveredMesh
      mesh.userData.hover = THREE.MathUtils.lerp(mesh.userData.hover, isHovered ? 1 : 0, 0.08)

      if (!isHovered) {
        gsap.set(mesh.scale, { x: 1, y: 1 })
      } else {
        const s = 1 + mesh.userData.hover * 0.03
        mesh.scale.set(s, s, 1)
      }

      const material = mesh.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = t
      material.uniforms.uOffset.value = x
      material.uniforms.uHover.value = mesh.userData.hover

      if (shouldCheckVideos && mesh.userData.video) {
        const video = mesh.userData.video
        const shouldPlay = Math.abs(x) < ACTIVE_RANGE
        if (shouldPlay && video.paused) {
          video.play().catch(() => {})
        } else if (!shouldPlay && !video.paused) {
          video.pause()
          video.currentTime = 0
        }
      }
    })

    if (closestIndex !== activeIndex) {
      activeIndex = closestIndex
      onActiveChange?.(activeIndex, projects[activeIndex])
    }

    renderer.render(scene, camera)
  }

  animate()
  playIntro()

  function destroy() {
    cancelAnimationFrame(rafId)
    cancelIntro()
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('resize', onResize)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointerup', endDrag)
    renderer.domElement.removeEventListener('pointercancel', endDrag)
    cards.forEach((mesh) => {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
      const video = mesh.userData.video
      if (video) {
        video.pause()
        video.src = ''
      }
    })
    renderer.dispose()
  }

  return { destroy, goToSlide }
}
