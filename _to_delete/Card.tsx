import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import './CardMaterial'
import { getPlaceholderTexture } from '../../lib/placeholderTexture'
import type { Project } from '../../data/projects'
import { useCarousel } from '../../store/useCarousel'

interface CardProps {
  project: Project
  angle: number
  radius: number
  width: number
  height: number
  onSelect: (project: Project, worldPos: THREE.Vector3) => void
}

export function Card({ project, angle, radius, width, height, onSelect }: CardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useMemo(() => getPlaceholderTexture(project), [project])
  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height, 32, 12), [width, height])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const rotation = useCarousel.getState().rotation
    const dragVelocity = useCarousel.getState().dragVelocity
    const theta = angle + rotation

    groupRef.current.position.set(Math.sin(theta) * radius, 0, Math.cos(theta) * radius - radius)
    groupRef.current.rotation.y = theta

    if (matRef.current) {
      matRef.current.uTime = state.clock.elapsedTime
      matRef.current.uVelocity = dragVelocity
      matRef.current.uHover = THREE.MathUtils.lerp(matRef.current.uHover ?? 0, hovered ? 1 : 0, delta * 6)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          if (useCarousel.getState().suppressClick) return
          if (groupRef.current) {
            const worldPos = new THREE.Vector3()
            groupRef.current.getWorldPosition(worldPos)
            onSelect(project, worldPos)
          }
        }}
      >
        {/* @ts-ignore */}
        <cardMaterialImpl ref={matRef} uMap={texture} transparent={false} />
      </mesh>
    </group>
  )
}
