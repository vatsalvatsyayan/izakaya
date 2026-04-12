import { useMemo } from 'react';

export function CRAHUnits() {
  const positions = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) {
      result.push([i * 2 - 4, 3.2, -2]);
      result.push([i * 2 - 4, 3.2, 2]);
    }
    return result;
  }, []);

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[1.4, 0.3, 1]} />
          <meshStandardMaterial color="#2A3042" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
