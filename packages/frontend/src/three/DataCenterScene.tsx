import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraController } from './CameraController';
import { ServerRacks } from './ServerRack';
import { CoolingTowers } from './CoolingTower';
import { PDUCabinets } from './PDUCabinet';
import { CRAHUnits } from './CRAHUnit';
import { DataFlow } from './DataFlow';
import { GroundPlane } from './GroundPlane';
import { SkyDome } from './SkyDome';
import { HeatHaze } from './effects/HeatHaze';
import { WaterParticles } from './effects/WaterParticles';
import { ElectricArcs } from './effects/ElectricArc';
import { useDashboardStore } from '../store/useDashboardStore';

// Steel-blue mid-tone background — noticeably lighter than the dark racks (#1E293B)
// so the geometry has clear contrast, but not so bright it becomes harsh.
const BG_COLOR = '#2E4B68';
const FOG = new THREE.Fog(BG_COLOR, 35, 95);

export function DataCenterScene() {
  const mode = useDashboardStore((s) => s.mode);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true }}
        onCreated={({ scene }) => {
          scene.fog = FOG;
        }}
      >
        {/* Medium blue-gray background — lighter than the UI panels to give
            the 3D scene spatial depth and make the sky legible */}
        <color attach="background" args={[BG_COLOR]} />

        {/* Hemisphere: sky blue-gray (#5080A8) above, dark ground (#111E32) below */}
        <hemisphereLight args={['#5080A8', '#111E32', 1.3]} />

        {/* Primary key light from upper-right */}
        <directionalLight position={[8, 12, 8]} intensity={2.0} />
        {/* Left-side fill */}
        <directionalLight position={[-6, 8, -4]} intensity={0.6} />
        {/* Back rim light */}
        <directionalLight position={[2, 5, -8]} intensity={0.4} />

        <CameraController />
        <SkyDome />
        <GroundPlane />
        <ServerRacks />
        <CoolingTowers />
        <PDUCabinets />
        <CRAHUnits />
        <DataFlow />
        <HeatHaze />
        <WaterParticles />
        <ElectricArcs />
      </Canvas>

      {/* Simulation mode blue tint overlay */}
      {mode === 'simulation' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(59, 130, 246, 0.10)',
            pointerEvents: 'none',
            transition: 'opacity 500ms ease-out',
          }}
        />
      )}
    </div>
  );
}
