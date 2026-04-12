import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { GroundPlane } from './GroundPlane';
import { SkyDome } from './SkyDome';
import { ServerRacks } from './ServerRack';
import { CoolingTowers } from './CoolingTower';
import { PDUCabinets } from './PDUCabinet';
import { CRAHUnits } from './CRAHUnit';
import { DataFlow } from './DataFlow';
import { HeatHaze } from './effects/HeatHaze';
import { WaterParticles } from './effects/WaterParticles';
import { ElectricArcs } from './effects/ElectricArc';

export function DataCenterScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.4} color="#B8C4D0" />
      <directionalLight intensity={0.8} position={[10, 20, 10]} />
      <hemisphereLight intensity={0.3} color="#87CEEB" groundColor="#2D2D2D" />

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
  );
}
