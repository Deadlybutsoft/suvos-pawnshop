import { useState, useMemo } from 'react';
import { Box, Edges } from '@react-three/drei';

type ItemBoxNPC = {
  id: string;
  item: string;
  hasItemBox: boolean;
  isLeaving: boolean;
  npcType?: string;
  itemData?: { baseValue: number; category: string };
};

function getBoxSize(baseValue: number): { w: number; h: number; d: number } {
  if (baseValue >= 4000) return { w: 0.42, h: 0.32, d: 0.35 };
  if (baseValue >= 2000) return { w: 0.34, h: 0.26, d: 0.28 };
  return { w: 0.28, h: 0.22, d: 0.24 };
}

const BOX_STYLES = [
  { color: '#1a1a2e', accent: '#d5a24d', metalness: 0.6, roughness: 0.15 },
  { color: '#2c1810', accent: '#e8c170', metalness: 0.5, roughness: 0.2 },
  { color: '#0f2027', accent: '#c0c0c0', metalness: 0.7, roughness: 0.1 },
  { color: '#1a0a2e', accent: '#d4a0ff', metalness: 0.55, roughness: 0.18 },
  { color: '#0a1a12', accent: '#7dcea0', metalness: 0.5, roughness: 0.2 },
];

function SellerBox({ npc, idx, onOpenBox }: { npc: ItemBoxNPC; idx: number; onOpenBox: (id: string, itemName: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const size = useMemo(() => getBoxSize(npc.itemData?.baseValue ?? 2000), [npc.itemData]);
  const style = useMemo(() => BOX_STYLES[Math.abs(npc.id.charCodeAt(0)) % BOX_STYLES.length], [npc.id]);
  const pattern = useMemo(() => Math.abs(npc.id.charCodeAt(1)) % 3, [npc.id]);

  return (
    <group
      position={[-0.8 + idx * 1.6, 1.22, 0.4]}
      onClick={(e) => { e.stopPropagation(); onOpenBox(npc.id, npc.item); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* Main body — glossy */}
      <Box args={[size.w, size.h, size.d]} castShadow receiveShadow>
        <meshStandardMaterial color={style.color} roughness={style.roughness} metalness={style.metalness} />
        <Edges visible={hovered} scale={1.01} color="#ffffff" lineWidth={8} />
      </Box>

      {/* Lid — glossy with edge highlight */}
      <Box args={[size.w + 0.015, 0.028, size.d + 0.015]} position={[0, size.h / 2 + 0.014, 0]} castShadow>
        <meshStandardMaterial color={style.color} roughness={style.roughness} metalness={style.metalness} />
        <Edges visible={hovered} scale={1.01} color="#ffffff" lineWidth={8} />
      </Box>

      {/* Accent trim — top edge of body */}
      <Box args={[size.w + 0.005, 0.008, size.d + 0.005]} position={[0, size.h / 2 - 0.004, 0]}>
        <meshStandardMaterial color={style.accent} metalness={0.8} roughness={0.15} />
      </Box>
      {/* Accent trim — bottom edge */}
      <Box args={[size.w + 0.005, 0.008, size.d + 0.005]} position={[0, -size.h / 2 + 0.004, 0]}>
        <meshStandardMaterial color={style.accent} metalness={0.8} roughness={0.15} />
      </Box>

      {/* Pattern: horizontal stripes */}
      {pattern === 0 && <>
        <Box args={[size.w + 0.003, 0.006, 0.003]} position={[0, 0.02, size.d / 2 + 0.002]}>
          <meshStandardMaterial color={style.accent} metalness={0.7} roughness={0.2} />
        </Box>
        <Box args={[size.w + 0.003, 0.006, 0.003]} position={[0, -0.02, size.d / 2 + 0.002]}>
          <meshStandardMaterial color={style.accent} metalness={0.7} roughness={0.2} />
        </Box>
      </>}

      {/* Pattern: center emblem */}
      {pattern === 1 && <>
        <Box args={[0.06, 0.06, 0.003]} position={[0, 0, size.d / 2 + 0.002]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial color={style.accent} metalness={0.8} roughness={0.15} />
        </Box>
      </>}

      {/* Pattern: cross bands */}
      {pattern === 2 && <>
        <Box args={[size.w + 0.003, 0.012, 0.003]} position={[0, 0, size.d / 2 + 0.002]}>
          <meshStandardMaterial color={style.accent} metalness={0.7} roughness={0.2} />
        </Box>
        <Box args={[0.003, size.h + 0.003, 0.003]} position={[0, 0, size.d / 2 + 0.002]}>
          <meshStandardMaterial color={style.accent} metalness={0.7} roughness={0.2} />
        </Box>
      </>}
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
