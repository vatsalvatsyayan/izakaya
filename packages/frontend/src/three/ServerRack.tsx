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

const HEALTH_INTENSITIES: Record<string, number> = {
  healthy: 0.6,
  warning: 0.7,
  critical: 0.9,
};

const PULSE_SPEEDS: Record<string, number> = {
  healthy: Math.PI / 1.0,
  warning: Math.PI / 0.7,
  critical: Math.PI / 0.22,
};

const RACK_BASE  = new THREE.Color('#1E293B');
const RACK_PANEL = new THREE.Color('#0D1520');
const HOVER_RED  = new THREE.Color('#EF4444');    // hover target
const HOVER_PANEL_RED = new THREE.Color('#7F1D1D'); // panel tint when hovered

function getThermalEmissive(temp: number): { color: THREE.Color; intensity: number } {
  if (temp >= 83) return { color: new THREE.Color('#dc2626'), intensity: 1.05 };
  if (temp >= 78) return { color: new THREE.Color('#ea580c'), intensity: 0.65 };
  if (temp >= 72) return { color: new THREE.Color('#f97316'), intensity: 0.35 };
  if (temp >= 65) return { color: new THREE.Color('#f59e0b'), intensity: 0.10 };
  return { color: new THREE.Color('#000000'), intensity: 0 };
}

function SingleRack({ position, index }: { position: [number, number, number]; index: number }) {
  const bodyRef      = useRef<THREE.Mesh>(null);
  const panelRef     = useRef<THREE.Mesh>(null);
  const ledRef       = useRef<THREE.Mesh>(null);
  const baseLightRef = useRef<THREE.PointLight>(null);
  const currentColor = useRef(new THREE.Color('#22C55E'));

  // Keep a ref mirror of hovered state for use inside useFrame
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  const handlePointerOver = () => { setHovered(true);  hoveredRef.current = true;  document.body.style.cursor = 'pointer'; };
  const handlePointerOut  = () => { setHovered(false); hoveredRef.current = false; document.body.style.cursor = 'default'; };

  useFrame(({ clock }) => {
    const state      = useDashboardStore.getState().simulationState;
    const isShutdown = state.layers.gpu.levers.gracefulRackShutdown[index];
    const health     = state.layers.gpu.health;
    const gpuTemp    = state.layers.gpu.averageGpuTemperature;
    const isHovered  = hoveredRef.current;

    // ── Body emissive ──
    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      if (isShutdown) {
        mat.emissive.lerp(new THREE.Color('#000000'), 0.1);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.35, 0.025);
      } else if (isHovered) {
        // Hover → bright red glow on the body
        mat.emissive.lerp(HOVER_RED, 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.55, 0.1);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.05);
      } else {
        // Normal → thermal coloring
        const th = getThermalEmissive(gpuTemp);
        mat.emissive.lerp(th.color, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, th.intensity, 0.05);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.025);
      }
    }

    // ── Front panel ──
    if (panelRef.current) {
      const mat = panelRef.current.material as THREE.MeshStandardMaterial;
      if (isHovered) {
        mat.emissive.lerp(HOVER_PANEL_RED, 0.1);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.08);
      } else {
        mat.emissive.lerp(new THREE.Color('#000000'), 0.1);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.08);
      }
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, isShutdown ? 0.35 : 1, 0.025);
    }

    // ── Base glow light — brighter on hover ──
    if (baseLightRef.current) {
      const targetIntensity = isShutdown ? 0 : isHovered ? 1.2 : 0.35;
      baseLightRef.current.intensity = THREE.MathUtils.lerp(baseLightRef.current.intensity, targetIntensity, 0.08);
      // Hover shifts base light color toward red
      baseLightRef.current.color.lerp(isHovered ? HOVER_RED : new THREE.Color('#38BDF8'), 0.08);
    }

    // ── LED health strip ──
    if (!ledRef.current) return;
    const ledMat = ledRef.current.material as THREE.MeshStandardMaterial;

    if (isShutdown) {
      ledMat.emissiveIntensity = THREE.MathUtils.lerp(ledMat.emissiveIntensity, 0, 0.05);
    } else {
      const target = HEALTH_COLORS[health] || HEALTH_COLORS.healthy;
      currentColor.current.lerp(target, 0.06);
      const speed = PULSE_SPEEDS[health] || PULSE_SPEEDS.healthy;
      const maxI  = HEALTH_INTENSITIES[health] || HEALTH_INTENSITIES.healthy;
      const pulse = THREE.MathUtils.lerp(maxI * 0.25, maxI, (Math.sin(clock.getElapsedTime() * speed) + 1) / 2);
      ledMat.emissive.copy(currentColor.current);
      ledMat.emissiveIntensity = pulse;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); const s = useDashboardStore.getState(); s.setSelectedHealthComponent('gpu'); s.selectLayer('gpu'); }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Main rack chassis */}
      <mesh ref={bodyRef}>
        <boxGeometry args={[1.2, 3, 0.8]} />
        <meshStandardMaterial color={RACK_BASE} metalness={0.75} roughness={0.25} transparent />
      </mesh>

      {/* Recessed front panel */}
      <mesh ref={panelRef} position={[0, 0, 0.38]}>
        <boxGeometry args={[1.0, 2.7, 0.02]} />
        <meshStandardMaterial color={RACK_PANEL} metalness={0.5} roughness={0.5} transparent />
      </mesh>

      {/* LED health strip */}
      <mesh ref={ledRef} position={[0.58, 0, 0.41]}>
        <boxGeometry args={[0.03, 2.5, 0.015]} />
        <meshStandardMaterial color="#050a10" emissive={new THREE.Color('#22C55E')} emissiveIntensity={0.6} />
      </mesh>

      {/* Base ambient point light — pools light on the floor beneath the rack */}
      <pointLight
        ref={baseLightRef}
        position={[0, -1.55, 0]}
        color="#38BDF8"
        intensity={0.35}
        distance={3.5}
        decay={2}
      />

      {/* Hover tooltip */}
      {hovered && (() => {
        const s      = useDashboardStore.getState().simulationState;
        const isDown = s.layers.gpu.levers.gracefulRackShutdown[index];
        const temp   = s.layers.gpu.averageGpuTemperature;
        const util   = s.layers.gpu.gpuUtilizationRate;
        return (
          <Html center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(127,29,29,0.96)',
              border: '1px solid #EF4444',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              whiteSpace: 'nowrap',
              color: '#fef2f2',
              boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 2, color: '#FCA5A5' }}>
                Rack {index + 1}
              </div>
              <div style={{ color: '#fecaca' }}>
                {isDown ? '⏹ SHUTDOWN' : `${temp.toFixed(1)}°C · ${(util * 100).toFixed(0)}% util`}
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
      result.push([i * 2 - 4, 1.5, -2]);
      result.push([i * 2 - 4, 1.5,  2]);
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
