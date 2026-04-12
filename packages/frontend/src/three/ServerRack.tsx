import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

// Returns thermal emissive color+intensity based on GPU temperature
function getThermalEmissive(temp: number): { color: THREE.Color; intensity: number } {
  if (temp >= 83) return { color: new THREE.Color('#dc2626'), intensity: 1.10 };
  if (temp >= 78) return { color: new THREE.Color('#ea580c'), intensity: 0.75 };
  if (temp >= 72) return { color: new THREE.Color('#f97316'), intensity: 0.40 };
  if (temp >= 65) return { color: new THREE.Color('#f59e0b'), intensity: 0.12 };
  return { color: new THREE.Color('#000000'), intensity: 0 };
}

function SingleRack({ position, index }: { position: [number, number, number]; index: number }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const ledRef = useRef<THREE.Mesh>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));
  const currentOpacity = useRef(1);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    // Always use .getState() inside useFrame — never call hooks here
    const state = useDashboardStore.getState().simulationState;
    const isShutdown = state.layers.gpu.levers.gracefulRackShutdown[index];
    const health = state.layers.gpu.health;
    const gpuTemp = state.layers.gpu.averageGpuTemperature;

    if (bodyRef.current) {
      const bodyMat = bodyRef.current.material as THREE.MeshStandardMaterial;

      if (isShutdown) {
        // Priority 2: rack is shut down — fade to dark
        bodyMat.emissive.set('#000000');
        bodyMat.emissiveIntensity = 0;
        bodyMat.opacity = THREE.MathUtils.lerp(bodyMat.opacity, 0.3, 0.02);
      } else {
        // Priority 3: thermal coloring
        const thermal = getThermalEmissive(gpuTemp);
        bodyMat.emissive.lerp(thermal.color, 0.05);
        bodyMat.emissiveIntensity = THREE.MathUtils.lerp(bodyMat.emissiveIntensity, thermal.intensity, 0.05);
        bodyMat.opacity = THREE.MathUtils.lerp(bodyMat.opacity, 1, 0.02);
      }
    }

    if (!ledRef.current) return;

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
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); const s = useDashboardStore.getState(); s.setSelectedHealthComponent('gpu'); s.selectLayer('gpu'); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
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
      {/* Hover tooltip — reads from store snapshot, not hooks */}
      {hovered && (() => {
        const s = useDashboardStore.getState().simulationState;
        const isDown = s.layers.gpu.levers.gracefulRackShutdown[index];
        const temp = s.layers.gpu.averageGpuTemperature;
        const util = s.layers.gpu.gpuUtilizationRate;
        return (
          <Html center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(26,29,39,0.95)',
              border: '1px solid #3d4168',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 10,
              whiteSpace: 'nowrap',
              color: '#fff',
            }}>
              <div style={{ fontWeight: 'bold' }}>Rack {index}</div>
              <div style={{ color: '#94a3b8' }}>
                {isDown ? 'SHUTDOWN' : `${temp.toFixed(1)}°C | ${(util * 100).toFixed(0)}% util`}
              </div>
            </div>
          </Html>
        );
      })()}
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
