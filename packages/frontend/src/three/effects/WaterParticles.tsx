import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../../store/useDashboardStore';

const MAX_PARTICLES = 300;
const dummy = new THREE.Object3D();
const TOWER_POS = new THREE.Vector3(-10, 2, 0);
const RACK_CENTER = new THREE.Vector3(0, 1.5, 0);
const NORMAL_COLOR = new THREE.Color('#38BDF8');
const RECIRC_COLOR = new THREE.Color('#06B6D4');
const tempColor = new THREE.Color();

export function WaterParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() =>
    Array.from({ length: MAX_PARTICLES }, () => ({
      t: Math.random(),
      speed: 0.005 + Math.random() * 0.01,
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 2,
      ),
      returning: Math.random() > 0.5,
    })), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const state = useDashboardStore.getState().simulationState;
    const coolingPower = state.layers.power.coolingPower;
    const isRecirc = state.layers.cooling.levers.waterRecirculationMode;
    const density = THREE.MathUtils.clamp(coolingPower / 200, 0.1, 1);
    const activeCount = Math.round(density * MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i];
      if (i >= activeCount) {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
      } else {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          if (isRecirc) p.returning = !p.returning;
        }

        const from = p.returning ? RACK_CENTER : TOWER_POS;
        const to = p.returning ? TOWER_POS : RACK_CENTER;
        dummy.position.lerpVectors(from, to, p.t);
        dummy.position.add(p.offset);
        dummy.scale.setScalar(0.06);
      }
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      tempColor.copy(isRecirc ? RECIRC_COLOR : NORMAL_COLOR);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial transparent opacity={0.5} />
    </instancedMesh>
  );
}
