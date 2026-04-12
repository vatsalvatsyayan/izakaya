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

const TOWER_COLOR = new THREE.Color('#263548');

function getCoolantThermalEmissive(temp: number): { color: THREE.Color; intensity: number } {
  if (temp >= 26) return { color: new THREE.Color('#dc2626'), intensity: 0.9 };
  if (temp >= 22) return { color: new THREE.Color('#ea580c'), intensity: 0.6 };
  if (temp >= 18) return { color: new THREE.Color('#f97316'), intensity: 0.3 };
  if (temp >= 15) return { color: new THREE.Color('#f59e0b'), intensity: 0.1 };
  return { color: new THREE.Color('#000000'), intensity: 0 };
}

function SingleTower({ position }: { position: [number, number, number] }) {
  const bodyRef      = useRef<THREE.Mesh>(null);
  const fanRef       = useRef<THREE.Mesh>(null);
  const baseLightRef = useRef<THREE.PointLight>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!fanRef.current) return;
    const state = useDashboardStore.getState().simulationState;

    const fanSpeedLever = state.layers.cooling.levers.fanSpeedOverride;
    const rotRate = (fanSpeedLever / 50) * 0.3;
    fanRef.current.rotation.y += rotRate * (1 / 60);

    const health      = state.layers.cooling.health;
    const coolantTemp = state.layers.cooling.coolantSupplyTemperature;

    if (bodyRef.current) {
      const mat     = bodyRef.current.material as THREE.MeshStandardMaterial;
      const thermal = getCoolantThermalEmissive(coolantTemp);
      const target  = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
      currentColor.current.lerp(target, 0.05);
      mat.emissive.lerp(thermal.intensity > 0 ? thermal.color : currentColor.current, 0.05);
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        thermal.intensity > 0 ? thermal.intensity : 0.15,
        0.05
      );
    }

    // Base light color tracks coolant temperature
    if (baseLightRef.current) {
      const thermal = getCoolantThermalEmissive(coolantTemp);
      // Cool → blue-white, hot → orange
      const lightColor = thermal.intensity > 0
        ? thermal.color
        : new THREE.Color('#7DD3FC'); // cool blue-white
      baseLightRef.current.color.lerp(lightColor, 0.04);
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); const s = useDashboardStore.getState(); s.setSelectedHealthComponent('cooling'); s.selectLayer('cooling'); }}
      onPointerOver={() => { setHovered(true);  document.body.style.cursor = 'pointer'; }}
      onPointerOut={()  => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* Tower body */}
      <mesh ref={bodyRef}>
        <cylinderGeometry args={[1, 1.2, 4, 8]} />
        <meshStandardMaterial color={TOWER_COLOR} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Fan disc */}
      <mesh ref={fanRef} position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.08, 6]} />
        <meshStandardMaterial color="#4B6070" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Fan hub */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Base ambient point light — pools light on the floor beneath the tower */}
      <pointLight
        ref={baseLightRef}
        position={[0, -1.8, 0]}
        color="#7DD3FC"
        intensity={0.6}
        distance={5}
        decay={2}
      />

      {/* Hover tooltip */}
      {hovered && (() => {
        const s   = useDashboardStore.getState().simulationState;
        const temp = s.layers.cooling.coolantSupplyTemperature;
        const wue  = s.layers.cooling.wue;
        return (
          <Html center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(15,23,42,0.97)',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              whiteSpace: 'nowrap',
              color: '#f8fafc',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 2, color: '#7DD3FC' }}>Cooling Tower</div>
              <div style={{ color: '#94a3b8' }}>
                {temp.toFixed(1)}°C supply · WUE {wue.toFixed(2)}
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
