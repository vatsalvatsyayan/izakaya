import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { ServerRacks } from './ServerRack';
import { CoolingTowers } from './CoolingTower';
import { PDUCabinets } from './PDUCabinet';
import { CRAHUnits } from './CRAHUnit';
import { DataFlow } from './DataFlow';
import { HeatHaze } from './effects/HeatHaze';
import { WaterParticles } from './effects/WaterParticles';
import { ElectricArcs } from './effects/ElectricArc';
import { useDashboardStore } from '../store/useDashboardStore';

export function DataCenterScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#c4d4db']} />
      <hemisphereLight args={['#dbeafe', '#a8a090', 1.2]} />
      <directionalLight position={[6, 10, 6]} intensity={2.8} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-4, 8, -3]} intensity={0.6} />
      <directionalLight position={[3, 4, -6]} intensity={0.4} />

      {/* Ground plane — click to select Location layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}
        onClick={() => { const s = useDashboardStore.getState(); s.setSelectedHealthComponent('location'); s.selectLayer('location'); }}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#8f8f87" roughness={0.95} />
      </mesh>

      <CameraController />
      <ServerRacks />
      <CoolingTowers />
      <PDUCabinets />
      <CRAHUnits />
      <DataFlow />
      <HeatHaze />
      <WaterParticles />
      <ElectricArcs />
    </Canvas>
  );
}
