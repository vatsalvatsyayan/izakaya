import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const MAX_PARTICLES = 2000;
const INGRESS_POS = new THREE.Vector3(10, 2, 0);
const EGRESS_POS = new THREE.Vector3(-6, 2, 0);

// Spec §1.5: #38BDF8 sky blue, fading to #0EA5E9 at egress; dropped = red
const BLUE_INGRESS = new THREE.Color('#38BDF8');
const BLUE_EGRESS = new THREE.Color('#0EA5E9');
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

    // Spec §1.5: density ~ request volume, speed ~ latency
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
        const s = 0.05 * fadeOut; // spec §1.5: radius ~0.05 scene units
        dummy.scale.set(s, s, s);
      }

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      if (p.dropped) {
        tempColor.copy(RED);
      } else {
        // Blend from sky blue (ingress) to deeper blue (egress) based on travel progress
        tempColor.copy(BLUE_INGRESS).lerp(BLUE_EGRESS, p.t);
      }
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  const handleClick = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const s = useDashboardStore.getState();
    s.setSelectedHealthComponent('workload');
    s.selectLayer('workload');
  }, []);

  return (
    <group onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}>
      {/* Particles — spec §1.5: small spheres radius ~0.05 */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial
          transparent
          opacity={0.85}
          emissive={BLUE_INGRESS}
          emissiveIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
}
