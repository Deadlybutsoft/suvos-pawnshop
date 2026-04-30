import { useRef, useState } from 'react';
import { Box, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type ItemBoxNPC = {
  id: string;
  item: string;
  hasItemBox: boolean;
  isLeaving: boolean;
};

function SellerBox({ npc, idx, onOpenBox }: { npc: ItemBoxNPC; idx: number; onOpenBox: (id: string, itemName: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);

  // Subtle float animation
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 1.22 + Math.sin(state.clock.elapsedTime * 2 + idx) * 0.02;
    }
  });

  return (
    <group
      ref={ref}
      position={[-0.8 + idx * 1.6, 1.22, 0.4]}
      onClick={(e) => { e.stopPropagation(); onOpenBox(npc.id, npc.item); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* Box */}
      <Box args={[0.3, 0.22, 0.3]} castShadow receiveShadow>
        <meshStandardMaterial color="#8b6914" roughness={0.85} />
        <Edges visible={hovered} scale={1.01} color="white" lineWidth={2} />
      </Box>
      {/* Lid */}
      <Box args={[0.32, 0.04, 0.32]} position={[0, 0.13, 0]} castShadow>
        <meshStandardMaterial color="#a07818" roughness={0.8} />
        <Edges visible={hovered} scale={1.01} color="white" lineWidth={2} />
      </Box>
      {/* Ribbon */}
      <Box args={[0.04, 0.23, 0.32]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#d4a017" metalness={0.6} roughness={0.3} />
      </Box>
      <Box args={[0.32, 0.23, 0.04]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#d4a017" metalness={0.6} roughness={0.3} />
      </Box>
    </group>
  );
}

export function ItemBoxes({ activeNPCs, onOpenBox }: { activeNPCs: ItemBoxNPC[]; onOpenBox: (id: string, itemName: string) => void }) {
  return (
    <group position={[0, 0, -1.0]}>
      {activeNPCs.filter(npc => npc.hasItemBox && !npc.isLeaving).map((npc, idx) => (
        <SellerBox key={npc.id} npc={npc} idx={idx} onOpenBox={onOpenBox} />
      ))}
    </group>
  );
}
