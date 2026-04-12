import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const HEALTH_COLORS: Record<string, THREE.Color> = {
  healthy: new THREE.Color('#22C55E'),
  warning: new THREE.Color('#F59E0B'),
  critical: new THREE.Color('#EF4444'),
};

const TOWER_COLOR = new THREE.Color('#3B4A5C');

function SingleTower({ position }: { position: [number, number, number] }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const fanRef = useRef<THREE.Mesh>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));

  useFrame(() => {
    if (!fanRef.current) return;
    const state = useDashboardStore.getState().simulationState;
    const fanSpeed = state.layers.cooling.levers.fanSpeedOverride;
    fanRef.current.rotation.y += fanSpeed * 0.1;

    const health = state.layers.cooling.health;
    const target = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
    currentColor.current.lerp(target, 0.05);

    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(currentColor.current);
      mat.emissiveIntensity = 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh ref={bodyRef}>
        <cylinderGeometry args={[1, 1.2, 4, 8]} />
        <meshStandardMaterial color={TOWER_COLOR} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Fan disc */}
      <mesh ref={fanRef} position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 6]} />
        <meshStandardMaterial color="#667788" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function CoolingTowers() {
  return (
    <group>
      <SingleTower position={[-10, 2, 5]} />
      <SingleTower position={[-10, 2, -5]} />
    </group>
  );
}
