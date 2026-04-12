import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useDashboardStore } from '../store/useDashboardStore';

const LAYER_TARGETS: Record<string, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  power: { position: new THREE.Vector3(12, 10, 8), target: new THREE.Vector3(-8, 0, 0) },
  cooling: { position: new THREE.Vector3(-10, 12, 15), target: new THREE.Vector3(-10, 0, 5) },
  gpu: { position: new THREE.Vector3(15, 12, 0), target: new THREE.Vector3(0, 0, 0) },
  workload: { position: new THREE.Vector3(0, 15, 18), target: new THREE.Vector3(0, 2, 0) },
  location: { position: new THREE.Vector3(30, 25, 30), target: new THREE.Vector3(0, 0, 0) },
};

const DEFAULT_POS = new THREE.Vector3(25, 20, 25);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

export function CameraController() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const selectedLayer = useDashboardStore((s) => s.selectedLayer);
  const animating = useRef(false);
  const startTime = useRef(0);
  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    const lt = selectedLayer ? LAYER_TARGETS[selectedLayer] : null;
    startPos.current.copy(camera.position);
    endPos.current.copy(lt?.position || DEFAULT_POS);
    if (controlsRef.current) {
      startTarget.current.copy(controlsRef.current.target);
    }
    endTarget.current.copy(lt?.target || DEFAULT_TARGET);
    animating.current = true;
    startTime.current = performance.now();
  }, [selectedLayer, camera]);

  useFrame(() => {
    if (!animating.current || !controlsRef.current) return;
    const elapsed = (performance.now() - startTime.current) / 800;
    const t = Math.min(1, elapsed);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    camera.position.lerpVectors(startPos.current, endPos.current, ease);
    controlsRef.current.target.lerpVectors(startTarget.current, endTarget.current, ease);
    controlsRef.current.update();

    if (t >= 1) animating.current = false;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      minPolarAngle={THREE.MathUtils.degToRad(20)}
      maxPolarAngle={THREE.MathUtils.degToRad(80)}
      minDistance={15}
      maxDistance={50}
      enableDamping
      dampingFactor={0.05}
    />
  );
}
