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

// Hair style generators
type HairStyle = 'flat' | 'tall' | 'mohawk' | 'side' | 'long' | 'bald' | 'afro' | 'buzz';
const HAIR_STYLES: HairStyle[] = ['flat','tall','mohawk','side','long','bald','afro','buzz'];

function generateTraits(gender: 'male' | 'female') {
  const skin = pick(SKIN_TONES);
  const hairColor = pick(HAIR_COLORS);
  const hairStyle = pick(HAIR_STYLES);
  const isFemale = gender === 'female';

  return {
    skin,
    shirt: pick(SHIRT_COLORS),
    pants: pick(PANT_COLORS),
    hairColor,
    hairStyle,
    // Accessories (each independent boolean)
    hasGlasses: chance(0.25),
    glassesColor: pick(['#1a1a1a','#4a3018','#c0392b','#2980b9']),
    hasHat: !chance(0.25) ? false : true, // 25%
    hatColor: pick(SHIRT_COLORS),
    hatStyle: pick(['cap','beanie','tophat'] as const),
    hasChain: chance(0.2),
    chainColor: pick(CHAIN_COLORS),
    hasScarf: chance(0.15),
    scarfColor: pick(SCARF_COLORS),
    hasHeadband: chance(0.1),
    headbandColor: pick(HEADBAND_COLORS),
    hasEarrings: chance(isFemale ? 0.4 : 0.15),
    earringColor: pick(EARRING_COLORS),
    hasBeard: !isFemale && chance(0.35),
    beardColor: hairColor,
    beardStyle: pick(['goatee','full','stubble'] as const),
    hasJacket: chance(0.3),
    jacketColor: pick(JACKET_COLORS),
    // Body variation
    bodyWidth: 0.45 + Math.random() * 0.15, // 0.45-0.6
    bodyHeight: 0.65 + Math.random() * 0.15, // 0.65-0.8
    headScale: 0.95 + Math.random() * 0.15, // 0.95-1.1
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
  const prevLineRef = useRef(currentLine);
  const talkingRef = useRef(false);
  const gesturePhaseRef = useRef(0);

  // Detect talking state from currentLine changes
  const isTalking = currentLine !== '' && currentLine !== '...';

  // Memoize body dimensions
  const body = useMemo(() => {
    const bw = traits.bodyWidth;
    const bh = traits.bodyHeight;
    const torsoY = 0.7 + bh / 2;
    const headY = 0.7 + bh + 0.2;
    const legH = 0.7;
    return { bw, bh, torsoY, headY, legH };
  }, [traits]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const t = state.clock.elapsedTime;

    // --- Movement ---
    const tX = targetPos[0];
    const tZ = isLeaving ? 5 : targetPos[2];
    const zDiff = Math.abs(g.position.z - tZ);
    const xDiff = Math.abs(g.position.x - tX);
    const isWalking = zDiff > 0.05 || xDiff > 0.05;

    if (isWalking) {
      const speed = 2.0;
      if (zDiff > 0.05) g.position.z += Math.sign(tZ - g.position.z) * Math.min(speed * delta, zDiff);
      if (xDiff > 0.05) g.position.x += Math.sign(tX - g.position.x) * Math.min(speed * delta, xDiff);
      // Walk bounce
      g.position.y = Math.abs(Math.sin(t * 10)) * 0.1;
      // Face target
      const angle = Math.atan2(tX - g.position.x, tZ - g.position.z);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, angle, delta * 5);
    } else {
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0, delta * 5);
      if (!isLeaving) {
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, Math.PI, delta * 5);
      }
    }

    // Visibility
    if (isLeaving && g.position.z > 4.9) { g.visible = false; } else { g.visible = true; }

    // --- Idle body sway (breathing / weight shift) ---
    if (!isWalking) {
      // Subtle torso sway
      g.children[0] && (g.rotation.z = Math.sin(t * 0.8) * 0.01);
    } else {
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, delta * 5);
    }

    // --- Eye blinking ---
    if (headRef.current) {
      const blinkCycle = t % (3 + Math.sin(t * 0.3) * 0.5); // Slightly irregular
      const isBlinking = blinkCycle < 0.08;
      const leftEye = headRef.current.getObjectByName('leftEye');
      const rightEye = headRef.current.getObjectByName('rightEye');
      if (leftEye) leftEye.scale.y = isBlinking ? 0.1 : 1;
      if (rightEye) rightEye.scale.y = isBlinking ? 0.1 : 1;
    }

    // --- Mouth animation (sync to talking) ---
    if (mouthRef.current) {
      if (isTalking) {
        // Rapid open/close to simulate speech
        const mouthOpen = (Math.sin(t * 12) * 0.5 + 0.5) * 0.04 + 0.01;
        mouthRef.current.scale.y = 1 + mouthOpen * 15;
        mouthRef.current.scale.x = 1 + Math.sin(t * 8) * 0.15;
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 1, delta * 10);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1, delta * 10);
      }
    }

    // --- Arm gestures ---
    if (leftArmRef.current && rightArmRef.current) {
      if (isTalking && !isWalking) {
        // Gesture while talking — arms move expressively
        gesturePhaseRef.current += delta * 3;
        const gp = gesturePhaseRef.current;
        leftArmRef.current.rotation.x = Math.sin(gp * 1.2) * 0.25;
        leftArmRef.current.rotation.z = Math.sin(gp * 0.8) * 0.1 - 0.05;
        rightArmRef.current.rotation.x = Math.sin(gp * 1.5 + 1) * 0.2;
        rightArmRef.current.rotation.z = Math.sin(gp * 0.9 + 2) * 0.1 + 0.05;
      } else if (isWalking) {
        // Walk arm swing
        leftArmRef.current.rotation.x = Math.sin(t * 10) * 0.3;
        rightArmRef.current.rotation.x = -Math.sin(t * 10) * 0.3;
        leftArmRef.current.rotation.z = 0;
        rightArmRef.current.rotation.z = 0;
      } else {
        // Idle — subtle sway
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.sin(t * 0.6) * 0.03, delta * 3);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, Math.sin(t * 0.6 + 1) * 0.03, delta * 3);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, delta * 3);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, delta * 3);
      }
    }

    // --- Head micro-movement ---
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
      <Box args={[bw, bh, 0.3]} position={[0, torsoY, 0]} castShadow>
        <meshStandardMaterial color={traits.shirt} />
      </Box>

      {/* Jacket (open front vest look) */}
      {traits.hasJacket && (
        <Box args={[bw + 0.06, bh - 0.05, 0.32]} position={[0, torsoY, 0]} castShadow>
          <meshStandardMaterial color={traits.jacketColor} />
        </Box>
      )}

      {/* Chain necklace */}
      {traits.hasChain && (
        <Cylinder args={[0.12, 0.14, 0.02, 8]} position={[0, torsoY + bh / 2 - 0.05, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={traits.chainColor} metalness={0.9} roughness={0.2} />
        </Cylinder>
      )}

      {/* Scarf */}
      {traits.hasScarf && (
        <Box args={[0.28, 0.12, 0.34]} position={[0, torsoY + bh / 2 - 0.02, 0]} castShadow>
          <meshStandardMaterial color={traits.scarfColor} />
        </Box>
      )}

      {/* === HEAD GROUP === */}
      <group position={[0, headY, 0]} ref={headRef} scale={[hs, hs, hs]}>
        {/* Head */}
        <Box args={[0.25, 0.28, 0.25]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>

        {/* --- HAIR STYLES --- */}
        {traits.hairStyle === 'flat' && (
          <Box args={[0.27, 0.06, 0.27]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {traits.hairStyle === 'tall' && (
          <Box args={[0.26, 0.14, 0.26]} position={[0, 0.16, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {traits.hairStyle === 'mohawk' && (
          <Box args={[0.08, 0.18, 0.24]} position={[0, 0.18, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {traits.hairStyle === 'side' && (<>
          <Box args={[0.27, 0.06, 0.27]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.06, 0.18, 0.26]} position={[-0.13, 0.05, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        </>)}
        {traits.hairStyle === 'long' && (<>
          <Box args={[0.27, 0.06, 0.27]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.27, 0.2, 0.06]} position={[0, 0, -0.13]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.06, 0.2, 0.2]} position={[-0.13, 0, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.06, 0.2, 0.2]} position={[0.13, 0, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        </>)}
        {traits.hairStyle === 'afro' && (
          <Sphere args={[0.2, 8, 8]} position={[0, 0.1, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Sphere>
        )}
        {traits.hairStyle === 'buzz' && (
          <Box args={[0.26, 0.03, 0.26]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {/* bald = no hair mesh */}

        {/* --- EYES --- */}
        {/* Eye whites */}
        <Box args={[0.055, 0.04, 0.01]} position={[-0.055, 0.03, 0.13]}>
          <meshStandardMaterial color="#f5f5f5" />
        </Box>
        <Box args={[0.055, 0.04, 0.01]} position={[0.055, 0.03, 0.13]}>
          <meshStandardMaterial color="#f5f5f5" />
        </Box>
        {/* Pupils */}
        <Box name="leftEye" args={[0.03, 0.03, 0.01]} position={[-0.055, 0.03, 0.135]} castShadow>
          <meshStandardMaterial color={traits.eyeColor} />
        </Box>
        <Box name="rightEye" args={[0.03, 0.03, 0.01]} position={[0.055, 0.03, 0.135]} castShadow>
          <meshStandardMaterial color={traits.eyeColor} />
        </Box>

        {/* Eyebrows */}
        <Box args={[0.06, 0.015, 0.01]} position={[-0.055, 0.06, 0.13]}>
          <meshStandardMaterial color={traits.hairColor} />
        </Box>
        <Box args={[0.06, 0.015, 0.01]} position={[0.055, 0.06, 0.13]}>
          <meshStandardMaterial color={traits.hairColor} />
        </Box>

        {/* Nose */}
        <Box args={[0.03, 0.04, 0.04]} position={[0, -0.01, 0.14]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>

        {/* Mouth */}
        <Box ref={mouthRef} args={[0.06, 0.02, 0.01]} position={[0, -0.06, 0.13]}>
          <meshStandardMaterial color="#8b3a3a" />
        </Box>

        {/* Ears */}
        <Box args={[0.04, 0.06, 0.04]} position={[-0.14, 0, 0]}>
          <meshStandardMaterial color={traits.skin} />
        </Box>
        <Box args={[0.04, 0.06, 0.04]} position={[0.14, 0, 0]}>
          <meshStandardMaterial color={traits.skin} />
        </Box>

        {/* --- BEARD --- */}
        {traits.hasBeard && traits.beardStyle === 'full' && (
          <Box args={[0.22, 0.12, 0.12]} position={[0, -0.1, 0.06]} castShadow>
            <meshStandardMaterial color={traits.beardColor} />
          </Box>
        )}
        {traits.hasBeard && traits.beardStyle === 'goatee' && (
          <Box args={[0.08, 0.1, 0.08]} position={[0, -0.1, 0.08]} castShadow>
            <meshStandardMaterial color={traits.beardColor} />
          </Box>
        )}
        {traits.hasBeard && traits.beardStyle === 'stubble' && (
          <Box args={[0.2, 0.06, 0.06]} position={[0, -0.08, 0.08]}>
            <meshStandardMaterial color={traits.beardColor} transparent opacity={0.4} />
          </Box>
        )}

        {/* --- GLASSES --- */}
        {traits.hasGlasses && (
          <group position={[0, 0.03, 0.14]}>
            <Box args={[0.07, 0.04, 0.01]} position={[-0.055, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} transparent opacity={0.7} />
            </Box>
            <Box args={[0.07, 0.04, 0.01]} position={[0.055, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} transparent opacity={0.7} />
            </Box>
            <Box args={[0.03, 0.008, 0.01]} position={[0, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} />
            </Box>
          </group>
        )}

        {/* --- HAT --- */}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'cap' && (
          <group position={[0, 0.18, 0]}>
            <Box args={[0.28, 0.1, 0.28]} castShadow>
              <meshStandardMaterial color={traits.hatColor} />
            </Box>
            <Box args={[0.28, 0.02, 0.14]} position={[0, -0.04, 0.2]} castShadow>
              <meshStandardMaterial color={traits.hatColor} />
            </Box>
          </group>
        )}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'beanie' && (
          <group position={[0, 0.16, 0]}>
            <Box args={[0.27, 0.12, 0.27]} castShadow>
              <meshStandardMaterial color={traits.hatColor} />
            </Box>
            <Sphere args={[0.03, 6, 6]} position={[0, 0.08, 0]}>
              <meshStandardMaterial color={traits.hatColor} />
            </Sphere>
          </group>
        )}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'tophat' && (
          <group position={[0, 0.22, 0]}>
            <Box args={[0.26, 0.2, 0.26]} castShadow>
              <meshStandardMaterial color="#1a1a1a" />
            </Box>
            <Box args={[0.34, 0.02, 0.34]} position={[0, -0.1, 0]} castShadow>
              <meshStandardMaterial color="#1a1a1a" />
            </Box>
          </group>
        )}

        {/* --- HEADBAND --- */}
        {traits.hasHeadband && !traits.hasHat && (
          <Box args={[0.27, 0.04, 0.27]} position={[0, 0.1, 0]} castShadow>
            <meshStandardMaterial color={traits.headbandColor} />
          </Box>
        )}

        {/* --- EARRINGS --- */}
        {traits.hasEarrings && (<>
          <Sphere args={[0.015, 6, 6]} position={[-0.14, -0.04, 0]}>
            <meshStandardMaterial color={traits.earringColor} metalness={0.9} roughness={0.1} />
          </Sphere>
          <Sphere args={[0.015, 6, 6]} position={[0.14, -0.04, 0]}>
            <meshStandardMaterial color={traits.earringColor} metalness={0.9} roughness={0.1} />
          </Sphere>
        </>)}
      </group>

      {/* === LEGS === */}
      <Box args={[0.2, 0.7, 0.2]} position={[-0.12, 0.35, 0]} castShadow>
        <meshStandardMaterial color={traits.pants} />
      </Box>
      <Box args={[0.2, 0.7, 0.2]} position={[0.12, 0.35, 0]} castShadow>
        <meshStandardMaterial color={traits.pants} />
      </Box>
      {/* Shoes */}
      <Box args={[0.2, 0.06, 0.26]} position={[-0.12, 0.03, 0.02]} castShadow>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      <Box args={[0.2, 0.06, 0.26]} position={[0.12, 0.03, 0.02]} castShadow>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>

      {/* === LEFT ARM (group for rotation pivot at shoulder) === */}
      <group ref={leftArmRef} position={[-(bw / 2 + 0.1), torsoY + bh / 2 - 0.1, 0]}>
        {/* Sleeve */}
        <Box args={[0.16, 0.22, 0.16]} position={[0, -0.1, 0]} castShadow>
          <meshStandardMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirt} />
        </Box>
        {/* Forearm */}
        <Box args={[0.14, 0.35, 0.14]} position={[0, -0.38, 0]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>
        {/* Hand */}
        <Box args={[0.1, 0.08, 0.1]} position={[0, -0.58, 0]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>
      </group>

      {/* === RIGHT ARM === */}
      <group ref={rightArmRef} position={[bw / 2 + 0.1, torsoY + bh / 2 - 0.1, 0]}>
        <Box args={[0.16, 0.22, 0.16]} position={[0, -0.1, 0]} castShadow>
          <meshStandardMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirt} />
        </Box>
        <Box args={[0.14, 0.35, 0.14]} position={[0, -0.38, 0]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>
        <Box args={[0.1, 0.08, 0.1]} position={[0, -0.58, 0]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>
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
