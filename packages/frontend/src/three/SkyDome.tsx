import { useRef } from 'react';
import * as THREE from 'three';

// Steel-blue gradient: slightly dark at zenith, lighter at horizon —
// visually distinct from the dark racks (#1E293B) but not harsh.
const ZENITH   = new THREE.Color('#C8D8E8');   // soft desaturated blue at top
const HORIZON  = new THREE.Color('#E4EBF2');   // very light blue-gray at horizon

export function SkyDome() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[80, 24, 24]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={{
          uZenith:  { value: ZENITH.clone()  },
          uHorizon: { value: HORIZON.clone() },
        }}
        vertexShader={`
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uZenith;
          uniform vec3 uHorizon;
          varying vec3 vWorldPos;
          void main() {
            float t = clamp(normalize(vWorldPos).y, 0.0, 1.0);
            // Smooth ease-in so horizon band is wider
            float blend = t * t;
            gl_FragColor = vec4(mix(uHorizon, uZenith, blend), 1.0);
          }
        `}
      />
    </mesh>
  );
}
