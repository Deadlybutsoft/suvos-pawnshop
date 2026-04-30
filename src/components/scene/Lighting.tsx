export function Lighting() {
  return (
    <>
      {/* Warm ambient base */}
      <ambientLight intensity={1.8} color="#ffe8c8" />

      {/* Main overhead — warm pendant light feel */}
      <pointLight
        position={[0, 3.0, -0.5]}
        intensity={35}
        distance={18}
        color="#ffe0b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Secondary overhead — spreads light evenly */}
      <pointLight
        position={[0, 3.0, 2.0]}
        intensity={20}
        distance={16}
        color="#fff2d6"
      />

      {/* Counter spotlight — highlights the action area */}
      <pointLight
        position={[0, 2.6, -1.2]}
        intensity={18}
        distance={10}
        color="#ffecc0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Warm left wall wash */}
      <pointLight
        position={[-2.8, 2, 0]}
        intensity={10}
        distance={10}
        color="#ffd9a0"
      />

      {/* Warm right wall wash */}
      <pointLight
        position={[2.8, 2, 0]}
        intensity={10}
        distance={10}
        color="#ffd9a0"
      />

      {/* Back wall accent — warm golden */}
      <pointLight
        position={[0, 2.2, -3.8]}
        intensity={12}
        distance={8}
        color="#ffcc70"
      />

      {/* Door entrance fill — slight cool contrast */}
      <pointLight
        position={[0, 2.0, 3.8]}
        intensity={8}
        distance={10}
        color="#e8eeff"
      />
    </>
  );
}
