import { Box, Cylinder, Sphere, Edges, useTexture } from "@react-three/drei";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function PawnShop({ doorOpen = false, onRadioClick }: { doorOpen?: boolean; onRadioClick?: () => void }) {
  const roomDepth = 8.0;
  const roomWidth = 6.0;
  const roomHeight = 3.2;

  return (
    <group>
      <Room width={roomWidth} height={roomHeight} depth={roomDepth} doorOpen={doorOpen} />
      <Counter position={[0, 0, -1.0]} />
      <Radio position={[1.0, 1.30, -1.2]} onClick={onRadioClick} />
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
  doorOpen,
}: {
  width: number;
  height: number;
  depth: number;
  doorOpen: boolean;
}) {
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  const floorTexture = useTexture("/floor.webp");
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(4, 6);

  const wallTex = useTexture("/new-left-wall.png");
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
  wallTex.repeat.set(2, 1);
  const rightWallTex = useTexture("/new-right-wall.png");
  const doorWallLeftTex = useTexture("/doorwallleft.png");
  const doorWallRightTex = useTexture("/doorwallright.png");
  const doorTopTex = useTexture("/door-top.png");
  const ceilingTex = useTexture("/cling.webp");
  const doorLeftTex = useTexture("/door-left.webp");
  const doorRightTex = useTexture("/door-right.webp");

  // Door dimensions
  const doorW = 0.8;   // each door panel width
  const doorH = 2.2;
  const gapW = doorW * 2; // total opening = 1.6
  const sideW = (width - gapW) / 2; // remaining wall on each side

  const openAngle = Math.PI * 0.47;

  // Smooth spring animation for door panels
  useFrame((_, delta) => {
    const targetL = doorOpen ? openAngle : 0;
    const targetR = doorOpen ? -openAngle : 0;
    const speed = 4; // spring-like lerp speed
    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y += (targetL - leftDoorRef.current.rotation.y) * Math.min(speed * delta, 1);
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y += (targetR - rightDoorRef.current.rotation.y) * Math.min(speed * delta, 1);
    }
  });

  return (
    <group>
      {/* Floor */}
      <Box args={[width, 0.1, depth]} position={[0, -0.05, 0]} receiveShadow>
        <meshStandardMaterial map={floorTexture} roughness={0.8} />
      </Box>

      {/* Ceiling */}
      <Box args={[width, 0.1, depth]} position={[0, height + 0.05, 0]}>
        <meshBasicMaterial map={ceilingTex} />
      </Box>

      {/* Crown molding / ceiling-wall divider */}
      {/* Back */}
      <Box args={[width + 0.1, 0.06, 0.12]} position={[0, height, -depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Front */}
      <Box args={[width + 0.1, 0.06, 0.12]} position={[0, height, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Left */}
      <Box args={[0.12, 0.06, depth + 0.1]} position={[-width / 2, height, 0]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Right */}
      <Box args={[0.12, 0.06, depth + 0.1]} position={[width / 2, height, 0]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>

      {/* Vertical corner trims — where walls meet */}
      {/* Back-left */}
      <Box args={[0.06, height, 0.06]} position={[-width / 2, height / 2, -depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Back-right */}
      <Box args={[0.06, height, 0.06]} position={[width / 2, height / 2, -depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Front-left */}
      <Box args={[0.06, height, 0.06]} position={[-width / 2, height / 2, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Front-right */}
      <Box args={[0.06, height, 0.06]} position={[width / 2, height / 2, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Front wall — left panel inner edge (where panel meets door) */}
      <Box args={[0.04, height, 0.06]} position={[-gapW / 2 - sideW, height / 2, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Front wall — right panel inner edge (where panel meets door) */}
      <Box args={[0.04, height, 0.06]} position={[gapW / 2 + sideW, height / 2, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>

      {/* Back wall */}
      <Box args={[width, height, 0.1]} position={[0, height / 2, -depth / 2]} receiveShadow>
        <meshStandardMaterial map={wallTex} color="#8b7355" roughness={0.85} metalness={0} />
      </Box>

      {/* Front wall — left panel */}
      <Box
        args={[sideW, height, 0.1]}
        position={[-width / 2 + sideW / 2, height / 2, depth / 2]}
        receiveShadow
      >
        <meshBasicMaterial map={doorWallLeftTex} />
      </Box>
      {/* Front wall — right panel */}
      <Box
        args={[sideW, height, 0.1]}
        position={[width / 2 - sideW / 2, height / 2, depth / 2]}
        receiveShadow
      >
        <meshBasicMaterial map={doorWallRightTex} />
      </Box>
      {/* Door top beam */}
      <Box
        args={[gapW, height - doorH, 0.1]}
        position={[0, doorH + (height - doorH) / 2, depth / 2]}
        receiveShadow
      >
        <meshBasicMaterial map={doorTopTex} />
      </Box>
      {/* Gold trim at bottom of door top image */}
      <Box args={[gapW + 0.02, 0.04, 0.12]} position={[0, doorH, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold trim — left side of door opening */}
      <Box args={[0.04, doorH, 0.12]} position={[-gapW / 2, doorH / 2, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold trim — right side of door opening */}
      <Box args={[0.04, doorH, 0.12]} position={[gapW / 2, doorH / 2, depth / 2]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.5} roughness={0.3} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>

      {/* Dark wall behind door opening */}
      <Box args={[gapW + 0.5, doorH + 0.5, 0.8]} position={[0, doorH / 2, depth / 2 + 0.5]}>
        <meshBasicMaterial color="#0a0604" />
      </Box>
      <mesh position={[0, doorH / 2, depth / 2 + 0.08]} rotation={[0, 0, 0]}>
        <planeGeometry args={[gapW, doorH]} />
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              float darkness = smoothstep(0.0, 0.5, 1.0 - vUv.y);
              gl_FragColor = vec4(0.02, 0.01, 0.005, mix(0.85, 1.0, darkness));
            }
          `}
          transparent
        />
      </mesh>

      {/* Left door — hinged at left edge, opens inward */}
      <group ref={leftDoorRef} position={[-gapW / 2, 0, depth / 2]}>
        <Box
          args={[doorW, doorH, 0.06]}
          position={[doorW / 2, doorH / 2, 0]}
          castShadow
        >
          <meshBasicMaterial map={doorRightTex} />
        </Box>
        {/* Handle */}
        <Box args={[0.06, 0.06, 0.12]} position={[doorW - 0.12, doorH / 2, 0.06]}>
          <meshStandardMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
        </Box>
      </group>

      {/* Right door — hinged at right edge, opens inward */}
      <group ref={rightDoorRef} position={[gapW / 2, 0, depth / 2]}>
        <Box
          args={[doorW, doorH, 0.06]}
          position={[-doorW / 2, doorH / 2, 0]}
          castShadow
        >
          <meshBasicMaterial map={doorLeftTex} />
        </Box>
        {/* Handle */}
        <Box args={[0.06, 0.06, 0.12]} position={[-(doorW - 0.12), doorH / 2, 0.06]}>
          <meshStandardMaterial color="#d4a017" metalness={0.8} roughness={0.2} />
        </Box>
      </group>

      {/* Left wall */}
      <Box args={[0.1, height, depth]} position={[-width / 2 - 0.05, height / 2, 0]} receiveShadow>
        <meshStandardMaterial map={wallTex} color="#8b7355" roughness={0.85} metalness={0} />
      </Box>

      {/* Right wall */}
      <Box args={[0.1, height, depth]} position={[width / 2 + 0.05, height / 2, 0]} receiveShadow>
        <meshStandardMaterial map={rightWallTex} color="#8b7355" roughness={0.85} metalness={0} />
      </Box>

      {/* Skirting board */}
      <Box args={[width, 0.2, 0.12]} position={[0, 0.1, -depth / 2 + 0.01]}>
        <meshStandardMaterial color="#38bdf8" />
      </Box>
    </group>
  );
}

function Counter({ position }: { position: [number, number, number] }) {
  const tableTex = useTexture("/table.webp");

  return (
    <group position={position}>
      {/* Counter base */}
      <Box
        args={[4.0, 1.1, 1]}
        position={[0, 0.55, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={tableTex} roughness={1} metalness={0} />
      </Box>

      {/* Front panels */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={`panel-${i}`}
          args={[0.5, 0.9, 0.05]}
          position={[-1.25 + i * 0.5, 0.55, 0.52]}
        >
          <meshStandardMaterial map={tableTex} roughness={1} metalness={0} />
        </Box>
      ))}

      {/* Counter top */}
      <Box
        args={[4.2, 0.08, 1.1]}
        position={[0, 1.14, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={tableTex} color="#8b6842" roughness={0.95} metalness={0} />
      </Box>

      {/* Gold edge trim — front */}
      <Box args={[4.22, 0.035, 0.025]} position={[0, 1.18, 0.56]} castShadow>
        <meshStandardMaterial color="#d5a24d" metalness={0.3} roughness={0.8} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold edge trim — back */}
      <Box args={[4.22, 0.035, 0.025]} position={[0, 1.18, -0.56]} castShadow>
        <meshStandardMaterial color="#d5a24d" metalness={0.3} roughness={0.8} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold edge trim — left */}
      <Box args={[0.025, 0.035, 1.12]} position={[-2.11, 1.18, 0]} castShadow>
        <meshStandardMaterial color="#d5a24d" metalness={0.3} roughness={0.8} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold edge trim — right */}
      <Box args={[0.025, 0.035, 1.12]} position={[2.11, 1.18, 0]} castShadow>
        <meshStandardMaterial color="#d5a24d" metalness={0.3} roughness={0.8} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>

      {/* Thin inner accent line — front */}
      <Box args={[4.18, 0.012, 0.012]} position={[0, 1.165, 0.54]} castShadow>
        <meshStandardMaterial color="#ffd877" metalness={0.3} roughness={0.8} emissive="#c89530" emissiveIntensity={0.2} />
      </Box>
    </group>
  );
}

function Radio({ position, onClick }: { position: [number, number, number]; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const outlineRef = useRef<THREE.Mesh>(null);
  const radioTex = useTexture("/radio.png");

  useFrame(() => {
    if (outlineRef.current) outlineRef.current.visible = hovered;
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  });

  return (
    <group
      position={position}
      rotation={[0, Math.PI, 0]}
      scale={[0.85, 0.85, 0.85]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      {/* Radio body — 16:9 */}
      <Box args={[0.48, 0.27, 0.12]} castShadow>
        <meshStandardMaterial color="#3a2010" roughness={0.7} metalness={0.1} attach="material-0" />
        <meshStandardMaterial color="#3a2010" roughness={0.7} metalness={0.1} attach="material-1" />
        <meshStandardMaterial color="#3a2010" roughness={0.7} metalness={0.1} attach="material-2" />
        <meshStandardMaterial color="#3a2010" roughness={0.7} metalness={0.1} attach="material-3" />
        <meshStandardMaterial map={radioTex} roughness={0.6} metalness={0.1} attach="material-4" />
        <meshStandardMaterial color="#3a2010" roughness={0.7} metalness={0.1} attach="material-5" />
      </Box>

      {/* Antenna */}
      <Cylinder args={[0.004, 0.002, 0.3, 4]} position={[0.2, 0.28, 0]} rotation={[0, 0, -0.15]}>
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </Cylinder>
      <Sphere args={[0.008, 6, 6]} position={[0.24, 0.42, 0]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.9} roughness={0.1} />
      </Sphere>

      {/* Hover white edge outline */}
      <Box ref={outlineRef} args={[0.48, 0.27, 0.12]} visible={false}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
        <Edges threshold={1} color="#ffffff" lineWidth={8} />
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
