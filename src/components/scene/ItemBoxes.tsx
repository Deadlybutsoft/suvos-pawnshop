import { Box, Text } from '@react-three/drei';

type ItemBoxNPC = {
  id: string;
  item: string;
  hasItemBox: boolean;
  isLeaving: boolean;
};

export function ItemBoxes({ activeNPCs, onOpenBox }: { activeNPCs: ItemBoxNPC[], onOpenBox: (id: string, itemName: string) => void }) {
  return (
    <group position={[0, 0, -1.0]}>
      {activeNPCs.filter(npc => npc.hasItemBox && !npc.isLeaving).map((npc, idx) => (
        <group 
          key={npc.id} 
          position={[-0.8 + idx * 1.6, 1.25, 0.4]} 
          onClick={(e) => {
            e.stopPropagation();
            onOpenBox(npc.id, npc.item);
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          {/* A small cardboard box */}
          <Box args={[0.3, 0.2, 0.3]} castShadow receiveShadow>
            <meshStandardMaterial color="#cfa976" roughness={0.9} />
          </Box>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            Tap to View
          </Text>
        </group>
      ))}
    </group>
  );
}
