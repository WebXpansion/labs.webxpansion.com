import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity; // signed, decaying drag velocity
  uniform float uBend; // static concave bend of the card surface
  uniform float uHover; // 0..1 hover lift

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // static concave bend across the card width, like a curved screen
    float bend = sin(uv.x * 3.14159265);
    pos.z -= bend * uBend;

    // dynamic "flag" wave distortion driven by drag velocity
    float edgeMask = smoothstep(0.0, 1.0, uv.x);
    float wave = sin(uv.x * 6.2831853 * 1.2 - uTime * 3.0) * uVelocity;
    pos.z += wave * edgeMask * 0.9;
    pos.y += wave * edgeMask * 0.12;

    // subtle hover lift toward camera
    pos.z += uHover * 0.25;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHover;
  uniform vec3 uTint;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    // gentle vignette toward edges
    float vign = smoothstep(0.9, 0.15, distance(vUv, vec2(0.5)));
    vec3 color = mix(tex.rgb * 0.85, tex.rgb, vign);
    color += uHover * 0.03;
    gl_FragColor = vec4(color, 1.0);
  }
`

const CardMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uVelocity: 0,
    uBend: 0.35,
    uHover: 0,
    uMap: new THREE.Texture(),
    uTint: new THREE.Color('#ffffff'),
  },
  vertexShader,
  fragmentShader,
)

extend({ CardMaterialImpl })

export { CardMaterialImpl }
