import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Ground is lighter than the racks (#1E293B) for contrast, darker than the sky.
// The metallic surface catches point-light pools from each machine.
const FLOOR_COLOR = new THREE.Color('#1E3348');
const GRID_COLOR  = new THREE.Color('#4A7298');   // matches horizon sky colour

function buildGridGeometry(size: number, divisions: number): THREE.BufferGeometry {
  const step = size / divisions;
  const half = size / 2;
  const positions: number[] = [];

  for (let i = 0; i <= divisions; i++) {
    const x = -half + i * step;
    positions.push(x, 0, -half, x, 0, half);
  }
  for (let i = 0; i <= divisions; i++) {
    const z = -half + i * step;
    positions.push(-half, 0, z, half, 0, z);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

export function GroundPlane() {
  const gridGeo = useMemo(() => buildGridGeometry(60, 40), []);
  const gridRef = useRef<THREE.LineSegments>(null);

  return (
    <group>
      {/* Floor base — slightly lighter, metallic sheen catches point lights */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={FLOOR_COLOR} metalness={0.25} roughness={0.75} />
      </mesh>

      {/* Raised-floor tile grid overlay */}
      <lineSegments ref={gridRef} geometry={gridGeo} position={[0, 0.001, 0]}>
        <lineBasicMaterial
          color={GRID_COLOR}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
