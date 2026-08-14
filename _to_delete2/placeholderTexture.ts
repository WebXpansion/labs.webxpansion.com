import * as THREE from 'three'
import type { Project } from '../data/projects'

const canvasCache = new Map<string, HTMLCanvasElement>()
const textureCache = new Map<string, THREE.CanvasTexture>()

export function getPlaceholderCanvas(project: Pick<Project, 'id' | 'title' | 'subtitle' | 'color' | 'accent'>): HTMLCanvasElement {
  const cached = canvasCache.get(project.id)
  if (cached) return cached

  const width = 1024
  const height = 1280
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, project.color)
  gradient.addColorStop(1, project.accent)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // subtle grain / noise dots
  ctx.globalAlpha = 0.05
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
  }
  ctx.globalAlpha = 1

  // decorative circle (echoes the "sphere" motif from the reference site) —
  // cards otherwise stay text-free, since the on-screen title/category now
  // live in the rolling footer (matching the source theme's video cards,
  // which carry no text overlay either).
  ctx.beginPath()
  ctx.arc(width * 0.72, height * 0.4, 170, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.fill()

  canvasCache.set(project.id, canvas)
  return canvas
}

export function getPlaceholderTexture(project: Project): THREE.CanvasTexture {
  const cached = textureCache.get(project.id)
  if (cached) return cached
  const canvas = getPlaceholderCanvas(project)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  textureCache.set(project.id, texture)
  return texture
}

export function getDetailTexture(color: string, label: string): string {
  // returns a data URL used as a simple <img> src for overlay galleries
  const width = 1200
  const height = 800
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.font = '400 28px Helvetica, Arial, sans-serif'
  ctx.fillText(label.toUpperCase(), 40, height - 40)
  return canvas.toDataURL('image/png')
}
