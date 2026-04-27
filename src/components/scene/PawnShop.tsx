import { Box, Cylinder, Sphere } from "@react-three/drei";

export function PawnShop() {
  const roomDepth = 8.0;
  const roomWidth = 5.0;
  const roomHeight = 3.5;

  return (
    <group>
      <Room width={roomWidth} height={roomHeight} depth={roomDepth} />
      <Counter position={[0, 0, -1.0]} />
      <ShopDecorations
        roomWidth={roomWidth}
        roomHeight={roomHeight}
        roomDepth={roomDepth}
      />
    </group>
  );
}

function Room({
  width,
  height,
  depth,
}: {
  width: number;
  height: number;
  depth: number;
}) {
  return (
    <group>
      {/* Bright polished floor — light gray vinyl/tile look */}
      <Box args={[width, 0.1, depth]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.1}
          metalness={0.05}
        />
      </Box>

      {/* Ceiling — Very bright white */}
      <Box args={[width, 0.1, depth]} position={[0, height + 0.05, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </Box>

      {/* DARK GRAY WALLS */}
      {/* Back wall */}
      <Box
        args={[width, height, 0.1]}
        position={[0, height / 2, -depth / 2]}
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Box>

      {/* Front wall (near entrance) */}
      <Box
        args={[width, height, 0.1]}
        position={[0, height / 2, depth / 2]}
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </Box>

      {/* Left wall */}
      <Box
        args={[0.1, height, depth]}
        position={[-width / 2 - 0.05, height / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </Box>

      {/* Right wall */}
      <Box
        args={[0.1, height, depth]}
        position={[width / 2 + 0.05, height / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </Box>

      {/* Fun accent: Colorful skirting boards */}
      <Box args={[width, 0.2, 0.12]} position={[0, 0.1, -depth / 2 + 0.01]}>
        <meshStandardMaterial color="#38bdf8" />
      </Box>
    </group>
  );
}

function Counter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Fun bright counter base — Sky Blue */}
      <Box
        args={[4.0, 1.1, 1]}
        position={[0, 0.55, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#0ea5e9" roughness={0.4} />
      </Box>

      {/* Colorful side panels */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={`panel-${i}`}
          args={[0.5, 0.9, 0.05]}
          position={[-1.25 + i * 0.5, 0.55, 0.52]}
        >
          <meshStandardMaterial
            color={i % 2 === 0 ? "#7dd3fc" : "#38bdf8"}
            roughness={0.5}
          />
        </Box>
      ))}

      {/* Counter top — Bright clean yellow */}
      <Box
        args={[4.2, 0.08, 1.1]}
        position={[0, 1.14, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#fbbf24" roughness={0.1} />
      </Box>

      {/* Fun glass display with bright contents */}
      <Box args={[1.8, 0.4, 0.8]} position={[1.0, 0.9, 0]}>
        <meshStandardMaterial
          transparent
          opacity={0.3}
          color="#bae6fd"
          roughness={0}
        />
      </Box>

      {/* Decorative items on counter */}
      {/* Pink Jewel */}
      <Sphere args={[0.08, 8, 8]} position={[-0.5, 1.25, 0.2]} castShadow>
        <meshStandardMaterial
          color="#f472b6"
          emissive="#f472b6"
          emissiveIntensity={0.2}
        />
      </Sphere>
      {/* Green Box */}
      <Box args={[0.2, 0.1, 0.2]} position={[-0.2, 1.19, 0.1]} castShadow>
        <meshStandardMaterial color="#4ade80" />
      </Box>
    </group>
  );
}

function ShopDecorations({
  roomWidth,
  roomHeight,
  roomDepth,
}: {
  roomWidth: number;
  roomHeight: number;
  roomDepth: number;
}) {
  return (
    <group>
      {/* Bright "OPEN" Neon Sign on back wall */}
      <Box args={[1.2, 0.5, 0.05]} position={[0, 2.5, -roomDepth / 2 + 0.1]}>
        <meshStandardMaterial color="#1e293b" />
      </Box>
      <Box args={[1.0, 0.3, 0.06]} position={[0, 2.5, -roomDepth / 2 + 0.11]}>
        <meshStandardMaterial
          color="#f87171"
          emissive="#ef4444"
          emissiveIntensity={2}
        />
      </Box>

      {/* Fun colorful wall shelves */}
      <Box
        args={[1.5, 0.05, 0.4]}
        position={[-1.5, 2.0, -roomDepth / 2 + 0.25]}
      >
        <meshStandardMaterial color="#fbbf24" />
      </Box>
      <Box args={[1.5, 0.05, 0.4]} position={[1.5, 2.2, -roomDepth / 2 + 0.25]}>
        <meshStandardMaterial color="#4ade80" />
      </Box>

      {/* Simple bright geometric items on shelves */}
      <Cylinder
        args={[0.1, 0.1, 0.3]}
        position={[-1.8, 2.18, -roomDepth / 2 + 0.25]}
        castShadow
      >
        <meshStandardMaterial color="#818cf8" />
      </Cylinder>
      <Sphere
        args={[0.12]}
        position={[-1.3, 2.15, -roomDepth / 2 + 0.25]}
        castShadow
      >
        <meshStandardMaterial color="#fb7185" />
      </Sphere>
      <Box
        args={[0.2, 0.2, 0.2]}
        position={[1.4, 2.33, -roomDepth / 2 + 0.25]}
        castShadow
      >
        <meshStandardMaterial color="#2dd4bf" />
      </Box>

      {/* Bright floor rug */}
      <Box args={[3.0, 0.01, 2.0]} position={[0, 0.01, 1.5]}>
        <meshStandardMaterial color="#f472b6" roughness={1} />
      </Box>
    </group>
  );
}
