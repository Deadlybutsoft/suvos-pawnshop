import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function GlassShelves({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const width = 2;
  const height = 2.5;
  const depth = 0.6;
  return (
    <group position={position} rotation={rotation}>
      {/* Metal Frame */}
      <Box args={[0.05, height, 0.05]} position={[-width/2 + 0.025, height/2, -depth/2 + 0.025]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.8} />
      </Box>
      <Box args={[0.05, height, 0.05]} position={[width/2 - 0.025, height/2, -depth/2 + 0.025]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.8} />
      </Box>
      <Box args={[0.05, height, 0.05]} position={[-width/2 + 0.025, height/2, depth/2 - 0.025]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.8} />
      </Box>
      <Box args={[0.05, height, 0.05]} position={[width/2 - 0.025, height/2, depth/2 - 0.025]} castShadow>
        <meshStandardMaterial color="#222" metalness={0.8} />
      </Box>

      {/* Glass Shelves */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i} position={[0, 0.4 + i * 0.45, 0]}>
           <Box args={[width-0.05, 0.02, depth-0.05]} castShadow>
             <meshStandardMaterial transparent opacity={0.3} color="#aaddff" roughness={0.1} />
           </Box>
           <RandomShelfItems width={width-0.2} depth={depth-0.2} seed={position[0] + position[2] + i} />
        </group>
      ))}
    </group>
  )
}

function RandomShelfItems({ width, depth, seed }: { width: number, depth: number, seed: number }) {
  const random = (s = 0) => {
    let x = Math.sin(seed + s) * 10000;
    return x - Math.floor(x);
  }
  
  const itemCount = Math.floor(random(1) * 6) + 2;
  const items = [];
  
  for(let i=0; i < itemCount; i++) {
    const type = Math.floor(random(i*10) * 4);
    const x = (random(i*11) - 0.5) * width;
    const z = (random(i*12) - 0.5) * depth;
    const itemScale = 0.1 + random(i*13) * 0.2;
    
    let color = new THREE.Color().setHSL(random(i*14), 0.5 + random(i*15)*0.5, 0.2 + random(i*16)*0.4);
    
    if (type === 0) { // Box 
      items.push(
        <Box key={i} args={[itemScale*0.8, itemScale, itemScale*0.5]} position={[x, itemScale/2, z]} castShadow>
          <meshStandardMaterial color={color} />
        </Box>
      )
    } else if (type === 1) { // Cylinder 
      items.push(
        <Cylinder key={i} args={[itemScale*0.4, itemScale*0.3, itemScale, 8]} position={[x, itemScale/2, z]} castShadow>
          <meshStandardMaterial color={color} />
        </Cylinder>
      )
    } else if (type === 2) { // Sphere 
      items.push(
        <Sphere key={i} args={[itemScale*0.4]} position={[x, itemScale*0.4, z]} castShadow>
           <meshStandardMaterial color={color} />
        </Sphere>
      )
    } else { // Small box 
       items.push(
        <Box key={i} args={[itemScale*1.5, itemScale*0.3, itemScale*1.2]} position={[x, itemScale*0.15, z]} castShadow>
          <meshStandardMaterial color="#222" />
        </Box>
      )
    }
  }

  return <group>{items}</group>;
}
