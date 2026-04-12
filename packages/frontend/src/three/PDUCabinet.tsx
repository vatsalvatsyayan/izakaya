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

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const store = useDashboardStore.getState();
    const selectedComponent = store.selectedHealthComponent;
    const health = store.simulationState.layers.power.health;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;

    if (selectedComponent === 'power') {
      const pulse = (Math.sin(clock.getElapsedTime() * 2) + 1) / 2;
      mat.emissive.set('#06b6d4');
      mat.emissiveIntensity = THREE.MathUtils.lerp(1.0, 1.6, pulse);
    } else {
      const target = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
      currentColor.current.lerp(target, 0.05);
      mat.emissive.copy(currentColor.current);
      mat.emissiveIntensity = 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
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
