import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDashboardStore } from '../../store/useDashboardStore';

function Arc({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const lineRef = useRef<THREE.Line>(null!);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const points = new Float32Array(10 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(points, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const state = useDashboardStore.getState().simulationState;
    const powerFrac = state.layers.power.levers.powerCap / 1200;
    const positions = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();

    for (let i = 0; i < 10; i++) {
      const frac = i / 9;
      const x = THREE.MathUtils.lerp(from.x, to.x, frac);
      const y = THREE.MathUtils.lerp(from.y, to.y, frac) + Math.sin(frac * Math.PI) * 0.5;
      const z = THREE.MathUtils.lerp(from.z, to.z, frac);
      const noise = Math.sin(t * 8 + i * 2) * 0.1 * powerFrac;
      positions.setXYZ(i, x + noise, y + noise * 0.5, z + noise);
    }
    positions.needsUpdate = true;

    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.3 + powerFrac * 0.5;
  });

  return (
    <primitive ref={lineRef} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#475569', transparent: true, opacity: 0.5 }))} />
  );
}

export function ElectricArcs() {
  const arcs = useMemo(() => {
    const result: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];
    for (let i = 0; i < 5; i++) {
      result.push({
        from: new THREE.Vector3(-8, 1.25, -1.5),
        to: new THREE.Vector3(i * 2 - 4, 1.5, -2),
      });
      result.push({
        from: new THREE.Vector3(-8, 1.25, -1.5),
        to: new THREE.Vector3(i * 2 - 4, 1.5, 2),
      });
    }
    return result;
  }, []);

  return (
    <group>
      {arcs.map((arc, i) => (
        <Arc key={i} from={arc.from} to={arc.to} />
      ))}
    </group>
  );
}
