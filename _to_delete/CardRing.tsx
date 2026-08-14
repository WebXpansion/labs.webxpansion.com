import * as THREE from 'three'
import { Card } from './Card'
import { projects } from '../../data/projects'
import type { Project } from '../../data/projects'

// The ring forms a full 360° loop so rotation is seamlessly infinite —
// slots are evenly spaced around the whole circle, and project data repeats
// (in a mirrored order to avoid an obvious repeat seam) to fill every slot.
export const SLOT_COUNT = 12
export const RING_RADIUS = 9.6
export const RING_ANGLE_STEP = (Math.PI * 2) / SLOT_COUNT
export const CARD_WIDTH = 4.2
export const CARD_HEIGHT = 2.7

const slotProjects: Project[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
  const cycle = [...projects, ...[...projects].reverse()]
  return cycle[i % cycle.length]
})

interface CardRingProps {
  onSelect: (project: Project, worldPos: THREE.Vector3) => void
}

export function CardRing({ onSelect }: CardRingProps) {
  return (
    <group>
      {slotProjects.map((project, i) => (
        <Card
          key={`${project.id}-${i}`}
          project={project}
          angle={i * RING_ANGLE_STEP}
          radius={RING_RADIUS}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
