import { projects } from '../data/projects'

// Kicks off network requests for the first few project videos (and the
// very first background image) as soon as the app boots — i.e. while the
// loading screen is still playing and the main thread is otherwise idle.
// By the time the loader fades and the real slider/mobile feed mounts its
// own <video>/<img> tags for the same URLs, the browser's HTTP cache
// already has some (or all) of the bytes, so playback starts sooner
// instead of waiting for a cold fetch.
//
// Rendered once at the top of the app and never unmounted — removing it
// once the real Scene takes over would cancel any request still in
// flight, throwing away the head start it was meant to give.
const PRELOAD_VIDEO_COUNT = 4
const PRELOAD_IMAGE_COUNT = 2

export function VideoPreloader() {
  const videos = projects.slice(0, PRELOAD_VIDEO_COUNT)
  const images = projects.slice(0, PRELOAD_IMAGE_COUNT)

  return (
    <div
      aria-hidden
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {videos.map((p) => (
        <video key={p.id} src={p.video} preload="auto" muted playsInline />
      ))}
      {images.map((p) => (
        <img key={p.id} src={p.bgImage} alt="" />
      ))}
    </div>
  )
}
