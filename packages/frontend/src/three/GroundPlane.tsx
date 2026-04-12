import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const GREEN = new THREE.Color('#22C55E');
const BROWN = new THREE.Color('#8B6914');

export function GroundPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));

  useFrame(() => {
    if (!meshRef.current) return;
    const wsi = useDashboardStore.getState().simulationState.layers.location.waterStressIndex;
    const target = new THREE.Color().copy(GREEN).lerp(BROWN, Math.min(1, wsi));
    currentColor.current.lerp(target, 0.05);
    (meshRef.current.material as THREE.MeshStandardMaterial).color.copy(currentColor.current);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#22C55E" metalness={0} roughness={1} />
    </mesh>
  );
}
