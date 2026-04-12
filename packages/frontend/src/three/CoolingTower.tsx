import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const HEALTH_COLORS: Record<string, THREE.Color> = {
  healthy: new THREE.Color('#22C55E'),
  warning: new THREE.Color('#F59E0B'),
  critical: new THREE.Color('#EF4444'),
};

const TOWER_COLOR = new THREE.Color('#3B4A5C');
const CYAN_EMISSIVE = new THREE.Color('#06b6d4');

// Thermal coloring based on coolant supply temperature
function getCoolantThermalEmissive(temp: number): { color: THREE.Color; intensity: number } {
  if (temp >= 26) return { color: new THREE.Color('#dc2626'), intensity: 0.9 };
  if (temp >= 22) return { color: new THREE.Color('#ea580c'), intensity: 0.6 };
  if (temp >= 18) return { color: new THREE.Color('#f97316'), intensity: 0.3 };
  if (temp >= 15) return { color: new THREE.Color('#f59e0b'), intensity: 0.1 };
  return { color: new THREE.Color('#000000'), intensity: 0 };
}

function SingleTower({ position }: { position: [number, number, number] }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const fanRef = useRef<THREE.Mesh>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!fanRef.current) return;
    const store = useDashboardStore.getState();
    const state = store.simulationState;
    const selectedComponent = store.selectedHealthComponent;

    const fanSpeed = state.layers.cooling.levers.fanSpeedOverride;
    fanRef.current.rotation.y += fanSpeed * 0.1;

    const health = state.layers.cooling.health;
    const coolantTemp = state.layers.cooling.coolantSupplyTemperature;

    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;

      if (selectedComponent === 'cooling') {
        // Priority 1: health component highlight — cyan glow
        const pulse = (Math.sin(clock.getElapsedTime() * 2) + 1) / 2;
        mat.emissive.copy(CYAN_EMISSIVE);
        mat.emissiveIntensity = THREE.MathUtils.lerp(1.0, 1.6, pulse);
      } else {
        // Priority 2: thermal coloring based on coolant temp
        const thermal = getCoolantThermalEmissive(coolantTemp);
        const target = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
        currentColor.current.lerp(target, 0.05);
        mat.emissive.lerp(thermal.intensity > 0 ? thermal.color : currentColor.current, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, thermal.intensity > 0 ? thermal.intensity : 0.15, 0.05);
      }
    }
  });

  return (
    <group
      position={position}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <mesh ref={bodyRef}>
        <cylinderGeometry args={[1, 1.2, 4, 8]} />
        <meshStandardMaterial color={TOWER_COLOR} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Fan disc */}
      <mesh ref={fanRef} position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 6]} />
        <meshStandardMaterial color="#667788" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Hover tooltip */}
      {hovered && (() => {
        const s = useDashboardStore.getState().simulationState;
        const temp = s.layers.cooling.coolantSupplyTemperature;
        const wue = s.layers.cooling.wue;
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
              <div style={{ fontWeight: 'bold' }}>Cooling Tower</div>
              <div style={{ color: '#94a3b8' }}>
                {temp.toFixed(1)}°C supply | WUE {wue.toFixed(2)}
              </div>
            </div>
          </Html>
        );
      })()}
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
