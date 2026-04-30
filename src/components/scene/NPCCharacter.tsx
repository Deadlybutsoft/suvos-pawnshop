import { useRef, useState, useMemo } from 'react';
import { Box, Html, Sphere, Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NPCPersonality } from '../../lib/npcPrompts';

// --- Trait pools ---
const SKIN_TONES = ['#f5d0b5','#e5c298','#c68642','#8d5524','#6b3e26','#f1c27d','#d4a574','#a0785d','#70503a','#3b2219'];
const SHIRT_COLORS = ['#c0392b','#27ae60','#e91e8a','#7f8c8d','#6d4c2e','#2d4a60','#a34850','#ecf0f1','#8e44ad','#f1c40f','#1abc9c','#e67e22','#2c3e50','#d35400','#16a085'];
const PANT_COLORS = ['#7f8c8d','#6d4c2e','#1a1a1a','#1a3d66','#2e5e3e','#1b2838','#2a2a2a','#c4a97d','#6b2020','#4a235a','#34495e','#1e3a2f'];
const HAIR_COLORS = ['#1a1a1a','#4a3018','#221100','#8e8e8e','#ffd700','#c0392b','#e67e22','#f5f5f5','#5b3a1a','#2c1608','#d4a574','#e91e8a','#3498db'];
const JACKET_COLORS = ['#1a1a1a','#2c3e50','#6d4c2e','#7f8c8d','#4a235a','#1b4332','#8b0000','#d4a574'];
const CHAIN_COLORS = ['#ffd700','#c0c0c0','#cd7f32','#e5e4e2'];
const HEADBAND_COLORS = ['#c0392b','#2980b9','#f1c40f','#27ae60','#e91e8a','#ecf0f1','#1a1a1a'];
const SCARF_COLORS = ['#c0392b','#2980b9','#f39c12','#8e44ad','#1abc9c','#ecf0f1'];
const EARRING_COLORS = ['#ffd700','#c0c0c0','#cd7f32'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(pct: number) { return Math.random() < pct; }

type HairStyle = 'flat' | 'tall' | 'mohawk' | 'side' | 'long' | 'bald' | 'afro' | 'buzz';
const HAIR_STYLES: HairStyle[] = ['flat','tall','mohawk','side','long','bald','afro','buzz'];

function generateTraits(gender: 'male' | 'female') {
  const skin = pick(SKIN_TONES);
  const hairColor = pick(HAIR_COLORS);
  const hairStyle = pick(HAIR_STYLES);
  const isFemale = gender === 'female';
  return {
    skin, shirt: pick(SHIRT_COLORS), pants: pick(PANT_COLORS), hairColor, hairStyle,
    hasGlasses: chance(0.25), glassesColor: pick(['#1a1a1a','#4a3018','#c0392b','#2980b9']),
    hasHat: chance(0.25), hatColor: pick(SHIRT_COLORS), hatStyle: pick(['cap','beanie','tophat'] as const),
    hasChain: chance(0.2), chainColor: pick(CHAIN_COLORS),
    hasScarf: chance(0.15), scarfColor: pick(SCARF_COLORS),
    hasHeadband: chance(0.1), headbandColor: pick(HEADBAND_COLORS),
    hasEarrings: chance(isFemale ? 0.4 : 0.15), earringColor: pick(EARRING_COLORS),
    hasBeard: !isFemale && chance(0.35), beardColor: hairColor, beardStyle: pick(['goatee','full','stubble'] as const),
    hasJacket: chance(0.3), jacketColor: pick(JACKET_COLORS),
    bodyWidth: 0.45 + Math.random() * 0.15,
    bodyHeight: 0.65 + Math.random() * 0.15,
    headScale: 0.95 + Math.random() * 0.15,
    eyeColor: pick(['#1a1a1a','#3b2219','#2980b9','#27ae60','#7f8c8d']),
  };
}

export function NPCCharacter({ id, npc, isLeaving, targetPos, currentLine, captionsEnabled }: {
  id: string; npc: NPCPersonality | null; isLeaving: boolean;
  targetPos: [number, number, number]; currentLine: string; captionsEnabled: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  const [traits] = useState(() => generateTraits(npc?.gender ?? 'male'));
  const gesturePhaseRef = useRef(0);

  const isTalking = currentLine !== '' && currentLine !== '...';

  const body = useMemo(() => {
    const bw = traits.bodyWidth;
    const bh = traits.bodyHeight;
    const torsoY = 0.7 + bh / 2;
    const headY = 0.7 + bh + 0.28;
    return { bw, bh, torsoY, headY };
  }, [traits]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const t = state.clock.elapsedTime;

    // Movement
    const tX = targetPos[0];
    const tZ = isLeaving ? 5 : targetPos[2];
    const zDiff = Math.abs(g.position.z - tZ);
    const xDiff = Math.abs(g.position.x - tX);
    const isWalking = zDiff > 0.05 || xDiff > 0.05;

    if (isWalking) {
      const speed = 2.0;
      if (zDiff > 0.05) g.position.z += Math.sign(tZ - g.position.z) * Math.min(speed * delta, zDiff);
      if (xDiff > 0.05) g.position.x += Math.sign(tX - g.position.x) * Math.min(speed * delta, xDiff);
      g.position.y = Math.abs(Math.sin(t * 10)) * 0.1;
      const angle = Math.atan2(tX - g.position.x, tZ - g.position.z);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, angle, delta * 5);
    } else {
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0, delta * 5);
      if (!isLeaving) g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, Math.PI, delta * 5);
    }

    if (isLeaving && g.position.z > 4.9) g.visible = false; else g.visible = true;

    if (!isWalking) g.rotation.z = Math.sin(t * 0.8) * 0.01;
    else g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, delta * 5);

    // Eye blinking
    if (headRef.current) {
      const blinkCycle = t % (3 + Math.sin(t * 0.3) * 0.5);
      const isBlinking = blinkCycle < 0.08;
      const leftEye = headRef.current.getObjectByName('leftEye');
      const rightEye = headRef.current.getObjectByName('rightEye');
      if (leftEye) leftEye.scale.y = isBlinking ? 0.1 : 1;
      if (rightEye) rightEye.scale.y = isBlinking ? 0.1 : 1;
    }

    // Mouth animation
    if (mouthRef.current) {
      if (isTalking) {
        const mouthOpen = (Math.sin(t * 12) * 0.5 + 0.5) * 0.04 + 0.01;
        mouthRef.current.scale.y = 1 + mouthOpen * 15;
        mouthRef.current.scale.x = 1 + Math.sin(t * 8) * 0.15;
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 1, delta * 10);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, delta * 10);
      }
    }

    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      if (isTalking && !isWalking) {
        gesturePhaseRef.current += delta * 3;
        const gp = gesturePhaseRef.current;
        leftArmRef.current.rotation.x = Math.sin(gp * 1.2) * 0.25;
        leftArmRef.current.rotation.z = Math.sin(gp * 0.8) * 0.1 - 0.05;
        rightArmRef.current.rotation.x = Math.sin(gp * 1.5 + 1) * 0.2;
        rightArmRef.current.rotation.z = Math.sin(gp * 0.9 + 2) * 0.1 + 0.05;
      } else if (isWalking) {
        leftArmRef.current.rotation.x = Math.sin(t * 10) * 0.3;
        rightArmRef.current.rotation.x = -Math.sin(t * 10) * 0.3;
        leftArmRef.current.rotation.z = 0;
        rightArmRef.current.rotation.z = 0;
      } else {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.sin(t * 0.6) * 0.03, delta * 3);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, Math.sin(t * 0.6 + 1) * 0.03, delta * 3);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 3);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, delta * 3);
      }
    }

    // Head micro-movement
    if (headRef.current) {
      if (isTalking) {
        headRef.current.rotation.y = Math.sin(t * 2) * 0.08;
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.04;
      } else {
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(t * 0.4) * 0.02, delta * 2);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, delta * 3);
      }
    }
  });

  const { bw, bh, torsoY, headY } = body;
  const hs = traits.headScale;

  return (
    <group ref={groupRef} position={[targetPos[0], 0, 5]} rotation={[0, Math.PI, 0]}>
      {/* === TORSO === */}
      {/* Main torso - rounded box shape */}
      <Box args={[bw, bh, 0.28]} position={[0, torsoY, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={traits.shirt} roughness={0.75} clearcoat={0.08} />
      </Box>
      {/* Shoulder area - slightly wider top */}
      <Box args={[bw + 0.06, 0.1, 0.26]} position={[0, torsoY + bh / 2 - 0.05, 0]} castShadow>
        <meshPhysicalMaterial color={traits.shirt} roughness={0.75} clearcoat={0.08} />
      </Box>

      {/* Jacket */}
      {traits.hasJacket && (<>
        <Box args={[bw + 0.07, bh - 0.05, 0.3]} position={[0, torsoY, 0]} castShadow>
          <meshPhysicalMaterial color={traits.jacketColor} roughness={0.6} clearcoat={0.12} />
        </Box>
        {/* Collar */}
        <Box args={[bw * 0.4, 0.06, 0.08]} position={[0, torsoY + bh / 2 + 0.02, 0.14]} castShadow>
          <meshPhysicalMaterial color={traits.jacketColor} roughness={0.6} clearcoat={0.12} />
        </Box>
      </>)}

      {/* Chain necklace */}
      {traits.hasChain && (
        <Cylinder args={[0.13, 0.15, 0.015, 12]} position={[0, torsoY + bh / 2 - 0.04, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={traits.chainColor} metalness={0.95} roughness={0.1} />
        </Cylinder>
      )}

      {/* Scarf */}
      {traits.hasScarf && (<>
        <Cylinder args={[0.14, 0.16, 0.1, 10]} position={[0, torsoY + bh / 2, 0]} castShadow>
          <meshPhysicalMaterial color={traits.scarfColor} roughness={0.85} />
        </Cylinder>
      </>)}

      {/* === NECK === */}
      <Cylinder args={[0.06, 0.07, 0.1, 8]} position={[0, torsoY + bh / 2 + 0.08, 0]} castShadow>
        <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
      </Cylinder>

      {/* === HEAD GROUP === */}
      <group position={[0, headY, 0]} ref={headRef} scale={[hs, hs, hs]}>
        {/* Head - sphere for natural shape */}
        <Sphere args={[0.17, 14, 14]} castShadow receiveShadow>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Sphere>

        {/* --- HAIR --- */}
        {traits.hairStyle === 'flat' && (
          <Sphere args={[0.175, 12, 12]} position={[0, 0.03, -0.01]} scale={[1, 0.5, 1]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Sphere>
        )}
        {traits.hairStyle === 'tall' && (
          <Sphere args={[0.16, 12, 12]} position={[0, 0.1, -0.01]} scale={[1, 1.2, 0.9]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Sphere>
        )}
        {traits.hairStyle === 'mohawk' && (
          <Box args={[0.06, 0.2, 0.22]} position={[0, 0.16, -0.01]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.7} />
          </Box>
        )}
        {traits.hairStyle === 'side' && (<>
          <Sphere args={[0.175, 12, 12]} position={[0, 0.03, -0.01]} scale={[1, 0.5, 1]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Sphere>
          <Box args={[0.06, 0.2, 0.2]} position={[-0.14, 0, 0]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Box>
        </>)}
        {traits.hairStyle === 'long' && (<>
          <Sphere args={[0.175, 12, 12]} position={[0, 0.03, -0.01]} scale={[1, 0.5, 1]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Sphere>
          <Box args={[0.3, 0.22, 0.06]} position={[0, -0.04, -0.14]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Box>
          <Box args={[0.06, 0.22, 0.18]} position={[-0.14, -0.04, -0.02]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Box>
          <Box args={[0.06, 0.22, 0.18]} position={[0.14, -0.04, -0.02]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.8} />
          </Box>
        </>)}
        {traits.hairStyle === 'afro' && (
          <Sphere args={[0.22, 14, 14]} position={[0, 0.06, 0]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.95} />
          </Sphere>
        )}
        {traits.hairStyle === 'buzz' && (
          <Sphere args={[0.175, 12, 12]} position={[0, 0.02, 0]} scale={[1, 0.35, 1]} castShadow>
            <meshPhysicalMaterial color={traits.hairColor} roughness={0.9} />
          </Sphere>
        )}

        {/* --- EYES --- */}
        {/* Eye whites */}
        <Sphere args={[0.028, 8, 8]} position={[-0.06, 0.02, 0.145]}>
          <meshStandardMaterial color="#f5f5f5" emissive="#ffffff" emissiveIntensity={0.08} />
        </Sphere>
        <Sphere args={[0.028, 8, 8]} position={[0.06, 0.02, 0.145]}>
          <meshStandardMaterial color="#f5f5f5" emissive="#ffffff" emissiveIntensity={0.08} />
        </Sphere>
        {/* Pupils */}
        <Sphere name="leftEye" args={[0.016, 8, 8]} position={[-0.06, 0.02, 0.165]}>
          <meshStandardMaterial color={traits.eyeColor} />
        </Sphere>
        <Sphere name="rightEye" args={[0.016, 8, 8]} position={[0.06, 0.02, 0.165]}>
          <meshStandardMaterial color={traits.eyeColor} />
        </Sphere>

        {/* Eyebrows */}
        <Box args={[0.055, 0.012, 0.015]} position={[-0.06, 0.055, 0.15]} rotation={[0, 0, 0.08]}>
          <meshStandardMaterial color={traits.hairColor} />
        </Box>
        <Box args={[0.055, 0.012, 0.015]} position={[0.06, 0.055, 0.15]} rotation={[0, 0, -0.08]}>
          <meshStandardMaterial color={traits.hairColor} />
        </Box>

        {/* Nose */}
        <Sphere args={[0.022, 8, 8]} position={[0, -0.015, 0.16]}>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Sphere>

        {/* Mouth */}
        <Cylinder ref={mouthRef} args={[0.028, 0.024, 0.008, 10]} position={[0, -0.065, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#8b3a3a" />
        </Cylinder>

        {/* Ears */}
        <Sphere args={[0.032, 8, 8]} position={[-0.17, 0, 0]}>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Sphere>
        <Sphere args={[0.032, 8, 8]} position={[0.17, 0, 0]}>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Sphere>

        {/* --- BEARD --- */}
        {traits.hasBeard && traits.beardStyle === 'full' && (
          <Sphere args={[0.14, 10, 10]} position={[0, -0.1, 0.04]} scale={[1, 0.7, 0.8]} castShadow>
            <meshPhysicalMaterial color={traits.beardColor} roughness={0.9} />
          </Sphere>
        )}
        {traits.hasBeard && traits.beardStyle === 'goatee' && (
          <Cylinder args={[0.03, 0.025, 0.08, 8]} position={[0, -0.1, 0.08]} castShadow>
            <meshPhysicalMaterial color={traits.beardColor} roughness={0.9} />
          </Cylinder>
        )}
        {traits.hasBeard && traits.beardStyle === 'stubble' && (
          <Sphere args={[0.15, 10, 10]} position={[0, -0.06, 0.03]} scale={[1, 0.4, 0.7]}>
            <meshStandardMaterial color={traits.beardColor} transparent opacity={0.35} />
          </Sphere>
        )}

        {/* --- GLASSES --- */}
        {traits.hasGlasses && (
          <group position={[0, 0.02, 0.16]}>
            <Cylinder args={[0.035, 0.035, 0.008, 10]} position={[-0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} transparent opacity={0.5} metalness={0.3} />
            </Cylinder>
            <Cylinder args={[0.035, 0.035, 0.008, 10]} position={[0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} transparent opacity={0.5} metalness={0.3} />
            </Cylinder>
            <Cylinder args={[0.004, 0.004, 0.04, 4]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color={traits.glassesColor} />
            </Cylinder>
          </group>
        )}

        {/* --- HAT --- */}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'cap' && (
          <group position={[0, 0.14, 0]}>
            <Sphere args={[0.18, 12, 12]} scale={[1, 0.45, 1]} castShadow>
              <meshPhysicalMaterial color={traits.hatColor} roughness={0.7} />
            </Sphere>
            <Box args={[0.22, 0.02, 0.1]} position={[0, -0.02, 0.16]} castShadow>
              <meshPhysicalMaterial color={traits.hatColor} roughness={0.7} />
            </Box>
          </group>
        )}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'beanie' && (
          <group position={[0, 0.12, 0]}>
            <Sphere args={[0.18, 12, 12]} scale={[1, 0.6, 1]} castShadow>
              <meshPhysicalMaterial color={traits.hatColor} roughness={0.85} />
            </Sphere>
            <Sphere args={[0.025, 6, 6]} position={[0, 0.1, 0]}>
              <meshPhysicalMaterial color={traits.hatColor} roughness={0.85} />
            </Sphere>
          </group>
        )}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'tophat' && (
          <group position={[0, 0.2, 0]}>
            <Cylinder args={[0.12, 0.13, 0.22, 12]} castShadow>
              <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} clearcoat={0.2} />
            </Cylinder>
            <Cylinder args={[0.18, 0.18, 0.02, 12]} position={[0, -0.11, 0]} castShadow>
              <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} clearcoat={0.2} />
            </Cylinder>
          </group>
        )}

        {/* --- HEADBAND --- */}
        {traits.hasHeadband && !traits.hasHat && (
          <Cylinder args={[0.175, 0.175, 0.04, 12]} position={[0, 0.08, 0]} castShadow>
            <meshPhysicalMaterial color={traits.headbandColor} roughness={0.7} />
          </Cylinder>
        )}

        {/* --- EARRINGS --- */}
        {traits.hasEarrings && (<>
          <Sphere args={[0.015, 6, 6]} position={[-0.17, -0.05, 0]}>
            <meshStandardMaterial color={traits.earringColor} metalness={0.95} roughness={0.08} />
          </Sphere>
          <Sphere args={[0.015, 6, 6]} position={[0.17, -0.05, 0]}>
            <meshStandardMaterial color={traits.earringColor} metalness={0.95} roughness={0.08} />
          </Sphere>
        </>)}
      </group>

      {/* === LEGS === */}
      {/* Left thigh */}
      <Box args={[0.18, 0.38, 0.2]} position={[-0.12, 0.52, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={traits.pants} roughness={0.75} clearcoat={0.06} />
      </Box>
      {/* Left calf */}
      <Box args={[0.15, 0.35, 0.17]} position={[-0.12, 0.18, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={traits.pants} roughness={0.75} clearcoat={0.06} />
      </Box>
      {/* Right thigh */}
      <Box args={[0.18, 0.38, 0.2]} position={[0.12, 0.52, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={traits.pants} roughness={0.75} clearcoat={0.06} />
      </Box>
      {/* Right calf */}
      <Box args={[0.15, 0.35, 0.17]} position={[0.12, 0.18, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={traits.pants} roughness={0.75} clearcoat={0.06} />
      </Box>
      {/* Shoes */}
      <Sphere args={[0.09, 8, 8]} position={[-0.12, 0.04, 0.03]} scale={[1.1, 0.4, 1.4]} castShadow>
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} clearcoat={0.25} />
      </Sphere>
      <Sphere args={[0.09, 8, 8]} position={[0.12, 0.04, 0.03]} scale={[1.1, 0.4, 1.4]} castShadow>
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.4} clearcoat={0.25} />
      </Sphere>

      {/* === LEFT ARM === */}
      <group ref={leftArmRef} position={[-(bw / 2 + 0.1), torsoY + bh / 2 - 0.1, 0]}>
        {/* Shoulder joint */}
        <Sphere args={[0.07, 8, 8]} position={[0, 0, 0]} castShadow>
          <meshPhysicalMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirt} roughness={0.75} clearcoat={0.08} />
        </Sphere>
        {/* Upper arm / sleeve */}
        <Box args={[0.14, 0.22, 0.14]} position={[0, -0.14, 0]} castShadow>
          <meshPhysicalMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirt} roughness={0.75} clearcoat={0.08} />
        </Box>
        {/* Forearm */}
        <Box args={[0.11, 0.3, 0.11]} position={[0, -0.38, 0]} castShadow>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Box>
        {/* Hand */}
        <Sphere args={[0.055, 8, 8]} position={[0, -0.56, 0]} castShadow>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Sphere>
      </group>

      {/* === RIGHT ARM === */}
      <group ref={rightArmRef} position={[bw / 2 + 0.1, torsoY + bh / 2 - 0.1, 0]}>
        <Sphere args={[0.07, 8, 8]} position={[0, 0, 0]} castShadow>
          <meshPhysicalMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirt} roughness={0.75} clearcoat={0.08} />
        </Sphere>
        <Box args={[0.14, 0.22, 0.14]} position={[0, -0.14, 0]} castShadow>
          <meshPhysicalMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirt} roughness={0.75} clearcoat={0.08} />
        </Box>
        <Box args={[0.11, 0.3, 0.11]} position={[0, -0.38, 0]} castShadow>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Box>
        <Sphere args={[0.055, 8, 8]} position={[0, -0.56, 0]} castShadow>
          <meshPhysicalMaterial color={traits.skin} roughness={0.55} clearcoat={0.15} />
        </Sphere>
      </group>

      {/* === CAPTION BUBBLE === */}
      {captionsEnabled && currentLine && currentLine !== "..." && (
        <Html position={[0, headY + 0.3, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-black/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl text-lg w-max max-w-[280px] whitespace-normal text-center shadow-2xl border border-white/20 select-none pointer-events-none transform -translate-y-full mb-1">
            {currentLine}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/90"></div>
          </div>
        </Html>
      )}
    </group>
  );
}
