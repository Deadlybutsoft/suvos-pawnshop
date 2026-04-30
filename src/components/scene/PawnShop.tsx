import { Box, Cylinder, Sphere, useTexture } from "@react-three/drei";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function PawnShop({ doorOpen = false, onRadioClick }: { doorOpen?: boolean; onRadioClick?: () => void }) {
  const roomDepth = 8.0;
  const roomWidth = 5.0;
  const roomHeight = 3.5;

  return (
    <group>
      <Room width={roomWidth} height={roomHeight} depth={roomDepth} doorOpen={doorOpen} />
      <Counter position={[0, 0, -1.0]} />
      <Radio position={[-1.6, 1.22, -1.0]} onClick={onRadioClick} />
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

  const wallTexture = useTexture("/wall.webp");
  const leftWallTex = useTexture("/left-wall.webp");
  const rightWallTex = useTexture("/right-wall.webp");
  const backWallTex = useTexture("/baclk-wall.webp");
  const frontWallTex = useTexture("/door-wall.webp");
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

      {/* Back wall */}
      <Box args={[width, height, 0.1]} position={[0, height / 2, -depth / 2]} receiveShadow>
        <meshBasicMaterial map={backWallTex} />
      </Box>

      {/* Front wall — left panel */}
      <Box
        args={[sideW, height, 0.1]}
        position={[-width / 2 + sideW / 2, height / 2, depth / 2]}
        receiveShadow
      >
        <meshBasicMaterial map={frontWallTex} />
      </Box>
      {/* Front wall — right panel */}
      <Box
        args={[sideW, height, 0.1]}
        position={[width / 2 - sideW / 2, height / 2, depth / 2]}
        receiveShadow
      >
        <meshBasicMaterial map={frontWallTex} />
      </Box>
      {/* Door top beam */}
      <Box
        args={[gapW, height - doorH, 0.1]}
        position={[0, doorH + (height - doorH) / 2, depth / 2]}
        receiveShadow
      >
        <meshBasicMaterial map={frontWallTex} />
      </Box>

      {/* Dark gradient behind door opening */}
      <mesh position={[0, doorH / 2, depth / 2 + 0.5]} rotation={[0, 0, 0]}>
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
              float darkness = smoothstep(0.0, 0.7, 1.0 - vUv.y);
              gl_FragColor = vec4(0.0, 0.0, 0.0, mix(0.6, 1.0, darkness));
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
        <meshBasicMaterial map={leftWallTex} />
      </Box>

      {/* Right wall */}
      <Box args={[0.1, height, depth]} position={[width / 2 + 0.05, height / 2, 0]} receiveShadow>
        <meshBasicMaterial map={rightWallTex} />
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
        <meshStandardMaterial map={tableTex} roughness={1} metalness={0} />
      </Box>

      {/* Gold edge trim — front */}
      <Box args={[4.22, 0.035, 0.025]} position={[0, 1.18, 0.56]} castShadow>
        <meshPhysicalMaterial color="#d5a24d" metalness={0.85} roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.1} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold edge trim — back */}
      <Box args={[4.22, 0.035, 0.025]} position={[0, 1.18, -0.56]} castShadow>
        <meshPhysicalMaterial color="#d5a24d" metalness={0.85} roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.1} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold edge trim — left */}
      <Box args={[0.025, 0.035, 1.12]} position={[-2.11, 1.18, 0]} castShadow>
        <meshPhysicalMaterial color="#d5a24d" metalness={0.85} roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.1} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>
      {/* Gold edge trim — right */}
      <Box args={[0.025, 0.035, 1.12]} position={[2.11, 1.18, 0]} castShadow>
        <meshPhysicalMaterial color="#d5a24d" metalness={0.85} roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.1} emissive="#a07828" emissiveIntensity={0.15} />
      </Box>

      {/* Thin inner accent line — front */}
      <Box args={[4.18, 0.012, 0.012]} position={[0, 1.165, 0.54]} castShadow>
        <meshPhysicalMaterial color="#ffd877" metalness={0.9} roughness={0.15} clearcoat={0.8} emissive="#c89530" emissiveIntensity={0.2} />
      </Box>
    </group>
  );
}

function Radio({ position, onClick }: { position: [number, number, number]; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.visible = hovered;
      if (hovered) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.15 + 0.85;
        glowRef.current.scale.setScalar(pulse);
      }
    }
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  });

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      {/* Radio body */}
      <Box args={[0.35, 0.2, 0.18]} castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
      </Box>
      {/* Speaker grille left */}
      <Box args={[0.1, 0.12, 0.01]} position={[-0.08, 0, 0.095]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      {/* Speaker grille right */}
      <Box args={[0.1, 0.12, 0.01]} position={[0.08, 0, 0.095]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      {/* Tuner dial */}
      <Cylinder args={[0.025, 0.025, 0.02, 8]} position={[-0.06, 0.06, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Volume knob */}
      <Cylinder args={[0.02, 0.02, 0.02, 8]} position={[0.06, 0.06, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Antenna */}
      <Cylinder args={[0.005, 0.003, 0.25, 4]} position={[0.12, 0.2, 0]} rotation={[0, 0, -0.2]}>
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </Cylinder>
      {/* Antenna tip */}
      <Sphere args={[0.008, 6, 6]} position={[0.17, 0.32, 0]}>
        <meshStandardMaterial color="#d5a24d" metalness={0.9} roughness={0.1} />
      </Sphere>
      {/* Hover glow outline */}
      <Box ref={glowRef} args={[0.38, 0.23, 0.21]} visible={false}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} emissive="#ffffff" emissiveIntensity={0.5} wireframe />
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
