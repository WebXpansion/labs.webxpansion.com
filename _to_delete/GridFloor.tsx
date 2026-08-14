import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const GridMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#3a3a3a'),
    uFogColor: new THREE.Color('#000000'),
  },
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uFogColor;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    float gridLine(vec2 coord, float thickness) {
      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      float line = min(grid.x, grid.y);
      return 1.0 - min(line / thickness, 1.0);
    }

    void main() {
      float cell = gridLine(vWorldPos.xz * 0.5, 1.2);
      float dist = length(vWorldPos.xz);
      float fade = smoothstep(28.0, 4.0, dist);
      vec3 color = mix(uFogColor, uColor, cell * fade);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
)

extend({ GridMaterial })

export function GridFloor() {
  const matRef = useRef<any>(null)
  useFrame(() => {
    if (matRef.current) matRef.current.needsUpdate = true
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, -6]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      {/* @ts-ignore */}
      <gridMaterial ref={matRef} transparent={false} />
    </mesh>
  )
}
