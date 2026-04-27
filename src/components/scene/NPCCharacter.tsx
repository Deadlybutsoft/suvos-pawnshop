import { useRef, useState } from 'react';
import { Box, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NPCPersonality } from '../../lib/npcPrompts';

export function NPCCharacter({ id, npc, isLeaving, targetPos, currentLine, captionsEnabled }: { id: string, npc: NPCPersonality | null, isLeaving: boolean, targetPos: [number, number, number], currentLine: string, captionsEnabled: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const [traits] = useState(() => {
    const shirtColors = ['red', 'green', 'pink', 'gray', 'brown', '#2d4a60', '#a34850', 'white', 'purple', 'yellow'];
    const hairColors = ['red', '#ffd700', 'orange', '#4a3018', '#221100', 'gray', 'black', 'white', 'blue', 'pink'];
    const pantColors = ['gray', 'brown', 'black', '#1a3d66', 'darkgreen', 'navy', '#2a2a2a', 'beige', 'darkred', 'purple'];
    
    // 3 accessories: 1: Glasses, 2: Hat, 3: Headband, 0: None
    const acc = Math.floor(Math.random() * 4);
    
    return {
      shirt: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      hair: hairColors[Math.floor(Math.random() * hairColors.length)],
      pants: pantColors[Math.floor(Math.random() * pantColors.length)],
      accessory: acc,
      headColor: npc?.gender === 'female' ? '#f5d0b5' : '#e5c298',
    };
  });
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Smoothly turn to face the player when arriving, or face the door when leaving
    const tX = isLeaving ? targetPos[0] : targetPos[0];
    const tZ = isLeaving ? 5 : targetPos[2];
    
    const zDiff = Math.abs(groupRef.current.position.z - tZ);
    const xDiff = Math.abs(groupRef.current.position.x - tX);
    
    if (zDiff > 0.05 || xDiff > 0.05) {
      // Walking
      const dirZ = Math.sign(tZ - groupRef.current.position.z);
      const dirX = Math.sign(tX - groupRef.current.position.x);
      const speed = 2.0;

      if (zDiff > 0.05) groupRef.current.position.z += dirZ * Math.min(speed * delta, zDiff);
      if (xDiff > 0.05) groupRef.current.position.x += dirX * Math.min(speed * delta, xDiff);

      groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
      
      // Face roughly towards target
      const angle = Math.atan2(tX - groupRef.current.position.x, tZ - groupRef.current.position.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        angle, 
        delta * 5
      );
    } else {
      // Standing
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
      if (!isLeaving) {
        // Face the player
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.PI, delta * 5);
      }
    }
    
    if (isLeaving && groupRef.current.position.z > 4.9) {
       groupRef.current.visible = false;
    } else {
       groupRef.current.visible = true;
    }

    // Blinking animation
    if (headRef.current) {
      const time = state.clock.elapsedTime;
      const blinkCycle = time % 4;
      const isBlinking = blinkCycle < 0.1; // Blink roughly every 4 seconds, for 0.1s
      const leftEye = headRef.current.getObjectByName('leftEye');
      const rightEye = headRef.current.getObjectByName('rightEye');
      if (leftEye) leftEye.scale.y = isBlinking ? 0.1 : 1;
      if (rightEye) rightEye.scale.y = isBlinking ? 0.1 : 1;
    }
  });

  return (
    <group ref={groupRef} position={[targetPos[0], 0, 5]} rotation={[0, Math.PI, 0]}>
      {/* Body / Torso (T-shirt) */}
      <Box args={[0.5, 0.7, 0.3]} position={[0, 1.05, 0]} castShadow>
        <meshStandardMaterial color={traits.shirt} />
      </Box>
      {/* Head Group */}
      <group position={[0, 1.6, 0]} ref={headRef}>
        {/* Head Box */}
        <Box args={[0.25, 0.25, 0.25]} castShadow>
          <meshStandardMaterial color={traits.headColor} />
        </Box>
        {/* Hair */}
        <Box args={[0.27, 0.08, 0.27]} position={[0, 0.12, 0]} castShadow>
          <meshStandardMaterial color={traits.hair} />
        </Box>

        {/* Accessories */}
        {traits.accessory === 1 && (
          // Glasses
          <group position={[0, 0.02, 0.13]}>
             <Box args={[0.1, 0.04, 0.01]} position={[-0.06, 0, 0]} castShadow>
               <meshStandardMaterial color="black" transparent opacity={0.8} />
             </Box>
             <Box args={[0.1, 0.04, 0.01]} position={[0.06, 0, 0]} castShadow>
               <meshStandardMaterial color="black" transparent opacity={0.8} />
             </Box>
             <Box args={[0.04, 0.01, 0.01]} position={[0, 0, 0]}>
               <meshStandardMaterial color="black" />
             </Box>
          </group>
        )}
        {traits.accessory === 2 && (
          // Hat (Baseball cap)
          <group position={[0, 0.15, 0]}>
            <Box args={[0.28, 0.1, 0.28]} castShadow>
               <meshStandardMaterial color={traits.shirt} />
            </Box>
            <Box args={[0.28, 0.02, 0.15]} position={[0, -0.04, 0.2]} castShadow>
               <meshStandardMaterial color={traits.shirt} />
            </Box>
          </group>
        )}
        {traits.accessory === 3 && (
          // Headband
          <Box args={[0.26, 0.05, 0.26]} position={[0, 0.08, 0]} castShadow>
            <meshStandardMaterial color="red" />
          </Box>
        )}

        {/* Left Eye */}
        <Box name="leftEye" args={[0.04, 0.04, 0.01]} position={[-0.05, 0.02, 0.13]} castShadow>
          <meshStandardMaterial color="#000000" />
        </Box>
        {/* Right Eye */}
        <Box name="rightEye" args={[0.04, 0.04, 0.01]} position={[0.05, 0.02, 0.13]} castShadow>
          <meshStandardMaterial color="#000000" />
        </Box>
        {/* Nose */}
        <Box args={[0.03, 0.03, 0.04]} position={[0, -0.02, 0.14]} castShadow>
          <meshStandardMaterial color="#be8e64" />
        </Box>
      </group>
      {/* Legs */}
      <Box args={[0.2, 0.7, 0.2]} position={[-0.12, 0.35, 0]} castShadow>
        <meshStandardMaterial color={traits.pants} />
      </Box>
      <Box args={[0.2, 0.7, 0.2]} position={[0.12, 0.35, 0]} castShadow>
        <meshStandardMaterial color={traits.pants} />
      </Box>
      {/* Arms Setup for T-Shirt look: short sleeves + bare arms */}
      {/* Left Arm Sleeves */}
      <Box args={[0.16, 0.25, 0.16]} position={[-0.35, 1.25, 0]} castShadow>
        <meshStandardMaterial color={traits.shirt} />
      </Box>
      {/* Left Arm */}
      <Box args={[0.15, 0.5, 0.15]} position={[-0.35, 0.9, 0]} castShadow>
        <meshStandardMaterial color={traits.headColor} />
      </Box>
      {/* Right Arm Sleeves */}
      <Box args={[0.16, 0.25, 0.16]} position={[0.35, 1.25, 0]} castShadow>
        <meshStandardMaterial color={traits.shirt} />
      </Box>
      {/* Right Arm */}
      <Box args={[0.15, 0.5, 0.15]} position={[0.35, 0.9, 0]} castShadow>
        <meshStandardMaterial color={traits.headColor} />
      </Box>

      {captionsEnabled && currentLine && currentLine !== "..." && (
        <Html position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-black/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl text-lg w-max max-w-[280px] whitespace-normal text-center shadow-2xl border border-white/20 select-none pointer-events-none transform -translate-y-full mb-1">
             {currentLine}
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/90"></div>
          </div>
        </Html>
      )}
    </group>
  )
}
