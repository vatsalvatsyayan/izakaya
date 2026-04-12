import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const HEALTH_COLORS: Record<string, THREE.Color> = {
  healthy: new THREE.Color('#22C55E'),
  warning: new THREE.Color('#F59E0B'),
  critical: new THREE.Color('#EF4444'),
};

function SinglePDU({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));

  useFrame(() => {
    if (!meshRef.current) return;
    const health = useDashboardStore.getState().simulationState.layers.power.health;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;

    const target = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
    currentColor.current.lerp(target, 0.05);
    mat.emissive.copy(currentColor.current);
    mat.emissiveIntensity = 0.15;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); const s = useDashboardStore.getState(); s.setSelectedHealthComponent('power'); s.selectLayer('power'); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <boxGeometry args={[1, 2.5, 0.6]} />
      <meshStandardMaterial color="#2E3B4E" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

export function PDUCabinets() {
  return (
    <group>
      <SinglePDU position={[-8, 1.25, 0]} />
      <SinglePDU position={[-8, 1.25, -3]} />
    </group>
  );
}
