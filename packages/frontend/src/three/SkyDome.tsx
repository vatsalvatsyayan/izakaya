import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const COOL_BLUE = new THREE.Color('#3B82F6');
const HOT_ORANGE = new THREE.Color('#F97316');
const CLEAN_BLUE = new THREE.Color('#3B82F6');
const DIRTY_BROWN = new THREE.Color('#78716C');
const TOP_COLOR = new THREE.Color('#0F172A');

export function SkyDome() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const horizonColor = useRef(new THREE.Color('#3B82F6'));

  useFrame(() => {
    if (!matRef.current) return;
    const state = useDashboardStore.getState().simulationState;
    const temp = state.layers.location.ambientTemperature;
    const carbon = state.layers.location.gridCarbonIntensity;

    const tempT = THREE.MathUtils.clamp((temp - 20) / 22, 0, 1);
    const carbonT = THREE.MathUtils.clamp((carbon - 200) / 200, 0, 1);

    const tempColor = new THREE.Color().copy(COOL_BLUE).lerp(HOT_ORANGE, tempT);
    const carbonColor = new THREE.Color().copy(CLEAN_BLUE).lerp(DIRTY_BROWN, carbonT);

    const target = new THREE.Color(
      (tempColor.r + carbonColor.r) / 2,
      (tempColor.g + carbonColor.g) / 2,
      (tempColor.b + carbonColor.b) / 2,
    );
    horizonColor.current.lerp(target, 0.05);

    matRef.current.uniforms.topColor.value.copy(TOP_COLOR);
    matRef.current.uniforms.bottomColor.value.copy(horizonColor.current);
  });

  return (
    <mesh>
      <sphereGeometry args={[80, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <shaderMaterial
        ref={matRef}
        side={THREE.BackSide}
        uniforms={{
          topColor: { value: TOP_COLOR.clone() },
          bottomColor: { value: new THREE.Color('#3B82F6') },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h)), 1.0);
          }
        `}
      />
    </mesh>
  );
}
