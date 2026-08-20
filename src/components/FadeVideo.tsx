import { useState, type CSSProperties, type VideoHTMLAttributes } from 'react'

interface FadeVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  poster: string
  /** Wrapper style — this is where borderRadius/position/inset etc. should
   *  go, not on the <video> itself, since the poster overlay needs to
   *  match its exact box. Defaults to `position: relative`; pass
   *  `position: 'absolute', inset: 0` to fill an already-positioned
   *  parent instead (e.g. MobileFeed's cards). */
  wrapperStyle?: CSSProperties
  /** Callback ref for the underlying <video> element, for callers that
   *  need direct access (e.g. MobileFeed's IntersectionObserver play/pause). */
  videoRef?: (el: HTMLVideoElement | null) => void
}

/** A <video> with its poster still kept on top, cross-fading out once the
 *  video has a decodable frame ready (`onLoadedData`) — deliberately NOT
 *  gated on actual playback (`onPlaying`): autoplay can be delayed or
 *  silently blocked (slow network, several videos competing for bandwidth
 *  on mobile, iOS being picky), and waiting on it left the poster stuck
 *  forever, making a project's videos indistinguishable from plain
 *  images. `loadeddata` fires as soon as that first frame exists, which
 *  is pixel-identical to the poster anyway (see `posterFor` in
 *  data/projects.ts), so the swap is invisible — then playback catches up
 *  underneath whenever the browser actually starts it.
 *  Deliberately no `aspect-ratio`/forced height on the wrapper: inside a
 *  column-flex layout (the overlay's gallery), `aspect-ratio` on a
 *  stretched flex item collapses to 0 height in at least one engine we
 *  tested (the width→aspect-ratio→height chain never resolves before
 *  layout). Letting the <video> stay in normal flow — `width: 100%`,
 *  `height: auto` — and sizing the poster overlay off its rendered box
 *  is what actually works everywhere. */
export function FadeVideo({ src, poster, wrapperStyle, style, videoRef, onLoadedData, ...videoProps }: FadeVideoProps) {
  const [showPoster, setShowPoster] = useState(true)
  return (
    <div style={{ position: 'relative', ...wrapperStyle }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onLoadedData={(e) => {
          setShowPoster(false)
          onLoadedData?.(e)
        }}
        style={{ display: 'block', width: '100%', ...style }}
        {...videoProps}
      />
      <img
        src={poster}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: showPoster ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
