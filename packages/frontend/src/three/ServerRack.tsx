import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const HEALTH_COLORS: Record<string, THREE.Color> = {
  healthy: new THREE.Color('#22C55E'),
  warning: new THREE.Color('#F59E0B'),
  critical: new THREE.Color('#EF4444'),
};

const PULSE_SPEEDS: Record<string, number> = {
  healthy: Math.PI / 1.0,   // 2.0s period
  warning: Math.PI / 0.75,  // 1.5s period
  critical: Math.PI / 0.4,  // 0.8s period
};

const RACK_COLOR = new THREE.Color('#2A3042');

function SingleRack({ position, index }: { position: [number, number, number]; index: number }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const ledRef = useRef<THREE.Mesh>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));
  const currentOpacity = useRef(1);

  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const state = useDashboardStore.getState().simulationState;
    const isShutdown = state.layers.gpu.levers.gracefulRackShutdown[index];
    const health = state.layers.gpu.health;

    if (isShutdown) {
      currentOpacity.current += (0.3 - currentOpacity.current) * 0.02;
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    } else {
      currentOpacity.current += (1 - currentOpacity.current) * 0.02;
      const targetColor = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
      currentColor.current.lerp(targetColor, 0.05);

      const speed = PULSE_SPEEDS[health] || PULSE_SPEEDS.healthy;
      const pulse = THREE.MathUtils.lerp(0.1, 0.4, (Math.sin(clock.getElapsedTime() * speed) + 1) / 2);

      const mat = ledRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(currentColor.current);
      mat.emissiveIntensity = pulse;
    }

    if (bodyRef.current) {
      (bodyRef.current.material as THREE.MeshStandardMaterial).opacity = currentOpacity.current;
    }
  });

  return (
    <group position={position}>
      {/* Rack body */}
      <mesh ref={bodyRef}>
        <boxGeometry args={[1.2, 3, 0.8]} />
        <meshStandardMaterial color={RACK_COLOR} metalness={0.6} roughness={0.4} transparent />
      </mesh>
      {/* LED strip */}
      <mesh ref={ledRef} position={[0.61, 0, 0]}>
        <boxGeometry args={[0.02, 2.5, 0.1]} />
        <meshStandardMaterial color="#111" emissive="#22C55E" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

export function ServerRacks() {
  const positions = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      result.push([i * 2 - 4, 1.5, -2]); // Front row
      result.push([i * 2 - 4, 1.5, 2]);  // Back row
    }
    return result;
  }, []);

  return (
    <group>
      {positions.map((pos, i) => (
        <SingleRack key={i} position={pos} index={i} />
      ))}
    </group>
  );
}
