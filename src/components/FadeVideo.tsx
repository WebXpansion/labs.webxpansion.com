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

/** A <video> with its poster still kept on top, cross-fading out only once
 *  the video actually starts painting frames (`onPlaying`). Autoplaying
 *  video can otherwise show a black flash for a beat before its first
 *  decoded frame lands — this keeps the poster (the video's own first
 *  frame, see `posterFor` in data/projects.ts) visible through that gap
 *  instead, so playback starts as a smooth fade rather than a glitch. */
export function FadeVideo({ src, poster, wrapperStyle, style, videoRef, onPlaying, ...videoProps }: FadeVideoProps) {
  const [showPoster, setShowPoster] = useState(true)
  return (
    <div style={{ position: 'relative', ...wrapperStyle }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onPlaying={(e) => {
          setShowPoster(false)
          onPlaying?.(e)
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
