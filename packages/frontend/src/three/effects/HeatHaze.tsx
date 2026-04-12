import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../../store/useDashboardStore';

const MAX_PARTICLES = 500;
const dummy = new THREE.Object3D();

export function HeatHaze() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() =>
    Array.from({ length: MAX_PARTICLES }, () => ({
      x: (Math.random() - 0.5) * 10 - 0.5,
      y: 3.5 + Math.random() * 3,
      z: (Math.random() - 0.5) * 6,
      speed: 0.01 + Math.random() * 0.01,
    })), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const temp = useDashboardStore.getState().simulationState.layers.gpu.averageGpuTemperature;
    const density = THREE.MathUtils.clamp((temp - 55) / 35, 0, 1);
    const activeCount = Math.round(density * MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i];
      if (i >= activeCount) {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
      } else {
        p.y += 0.02;
        p.x += (Math.random() - 0.5) * 0.01;
        if (p.y > 8) {
          p.y = 3.5;
          p.x = (Math.random() - 0.5) * 10 - 0.5;
          p.z = (Math.random() - 0.5) * 6;
        }
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(0.1);
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#F97316" transparent opacity={0.3} />
    </instancedMesh>
  );
}
