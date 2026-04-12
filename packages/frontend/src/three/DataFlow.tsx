import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const MAX_PARTICLES = 2000;
const INGRESS_POS = new THREE.Vector3(10, 2, 0);
const EGRESS_POS = new THREE.Vector3(-6, 2, 0);
const BLUE = new THREE.Color('#60A5FA');
const RED = new THREE.Color('#EF4444');

const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

export function DataFlow() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: MAX_PARTICLES }, () => ({
      t: Math.random(),
      active: false,
      dropped: false,
      offset: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
      ),
    }));
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const state = useDashboardStore.getState().simulationState;
    const { requestVolume, averageInferenceLatency, requestDropRate } = state.layers.workload;

    const activeCount = Math.min(MAX_PARTICLES, Math.round(requestVolume / 5));
    const speed = THREE.MathUtils.mapLinear(
      Math.min(averageInferenceLatency, 500), 45, 500, 0.02, 0.003
    );

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i];
      p.active = i < activeCount;

      if (!p.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
      } else {
        p.t += speed;
        if (p.t > 1) {
          p.t = 0;
          p.dropped = Math.random() < requestDropRate;
          p.offset.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
          );
        }

        const dropT = p.dropped ? Math.min(p.t, 0.7) : p.t;
        dummy.position.lerpVectors(INGRESS_POS, EGRESS_POS, dropT);
        dummy.position.add(p.offset);

        const fadeOut = p.dropped && p.t > 0.5 ? 1 - (p.t - 0.5) / 0.5 : 1;
        const s = 0.08 * fadeOut;
        dummy.scale.set(s, s, s);
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      tempColor.copy(p.dropped ? RED : BLUE);
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* Ingress sphere */}
      <mesh position={INGRESS_POS.toArray()}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Egress sphere */}
      <mesh position={EGRESS_POS.toArray()}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.3} metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Particles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial transparent opacity={0.7} />
      </instancedMesh>
    </group>
  );
}
