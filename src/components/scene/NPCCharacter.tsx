import { useRef, useState, useMemo, useEffect } from 'react';
import { Box, Html, Sphere, Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NPCPersonality } from '../../lib/npcPrompts';

// --- Trait pools (more vibrant) ---
const SKIN_TONES = ['#f5d0b5','#e5c298','#c68642','#8d5524','#6b3e26','#f1c27d','#d4a574','#a0785d','#70503a','#3b2219'];
const SHIRT_COLORS = ['#e74c3c','#2ecc71','#ff6bcb','#3498db','#f39c12','#9b59b6','#1abc9c','#e67e22','#ff4757','#2ed573','#1e90ff','#ffa502','#ff6348','#7bed9f','#70a1ff','#eccc68','#ff7979','#badc58','#686de0','#f9ca24','#eb4d4b','#6ab04c'];
const PANT_COLORS = ['#546e7a','#5d4037','#1a1a2e','#1a3d66','#2e5e3e','#37474f','#4a148c','#bf360c','#004d40','#1b5e20','#0d47a1','#4e342e','#263238','#880e4f'];
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
type Expression = 'neutral' | 'happy' | 'angry' | 'surprised' | 'smug';
const EXPRESSIONS: Expression[] = ['neutral','happy','angry','surprised','smug'];

function generateTraits(gender: 'male' | 'female') {
  const skin = pick(SKIN_TONES);
  const hairColor = pick(HAIR_COLORS);
  const hairStyle = pick(HAIR_STYLES);
  const isFemale = gender === 'female';
  return {
    skin, shirt: pick(SHIRT_COLORS), pants: pick(PANT_COLORS), hairColor, hairStyle,
    shirtAccent: pick(SHIRT_COLORS), // secondary color for shirt detail
    hasStripe: chance(0.4),
    hasGlasses: chance(0.25), glassesColor: pick(['#1a1a1a','#4a3018','#c0392b','#2980b9']),
    hasHat: chance(0.25), hatColor: pick(SHIRT_COLORS), hatStyle: pick(['cap','beanie','tophat'] as const),
    hasChain: chance(0.2), chainColor: pick(CHAIN_COLORS),
    hasScarf: chance(0.15), scarfColor: pick(SCARF_COLORS),
    hasHeadband: chance(0.1), headbandColor: pick(HEADBAND_COLORS),
    hasEarrings: chance(isFemale ? 0.4 : 0.15), earringColor: pick(EARRING_COLORS),
    hasBeard: !isFemale && chance(0.35), beardColor: hairColor, beardStyle: pick(['goatee','full','stubble'] as const),
    hasJacket: chance(0.3), jacketColor: pick(JACKET_COLORS),
    hasCheekBlush: chance(0.3),
    expression: pick(EXPRESSIONS),
    bodyWidth: 0.45 + Math.random() * 0.15,
    bodyHeight: 0.65 + Math.random() * 0.15,
    headScale: 0.95 + Math.random() * 0.15,
    eyeColor: pick(['#1a1a1a','#3b2219','#2980b9','#27ae60','#7f8c8d']),
  };
}

export function NPCCharacter({ id, npc, isLeaving, targetPos, currentLine, voiceDuration, captionsEnabled }: {
  id: string; npc: NPCPersonality | null; isLeaving: boolean;
  targetPos: [number, number, number]; currentLine: string; voiceDuration: number; captionsEnabled: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);

  const [traits] = useState(() => generateTraits(npc?.gender ?? 'male'));
  const gesturePhaseRef = useRef(0);

  const isTalking = currentLine !== '' && currentLine !== '...';

  // Typewriter effect synced with voice duration
  const [displayedText, setDisplayedText] = useState('');
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null; }
    if (!isTalking || isLeaving || !captionsEnabled) { setDisplayedText(''); return; }
    setDisplayedText('');
    const text = currentLine;
    const dur = (voiceDuration || Math.max(1.5, text.length * 0.06)) * 1000;
    const interval = Math.max(20, dur / text.length);
    let i = 0;
    typewriterRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length && typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null; }
    }, interval);
    return () => { if (typewriterRef.current) { clearInterval(typewriterRef.current); typewriterRef.current = null; } };
  }, [currentLine, voiceDuration, isLeaving, captionsEnabled, isTalking]);

  const body = useMemo(() => {
    const bw = traits.bodyWidth;
    const bh = traits.bodyHeight;
    const torsoY = 0.7 + bh / 2;
    const headY = 0.7 + bh + 0.2;
    return { bw, bh, torsoY, headY };
  }, [traits]);

  // Expression-based brow/mouth targets
  const expr = useMemo(() => {
    switch (traits.expression) {
      case 'happy': return { browY: 0.065, browAngleL: -0.1, browAngleR: 0.1, mouthW: 0.08, mouthColor: '#c0544a' };
      case 'angry': return { browY: 0.05, browAngleL: 0.3, browAngleR: -0.3, mouthW: 0.05, mouthColor: '#6b2020' };
      case 'surprised': return { browY: 0.075, browAngleL: 0, browAngleR: 0, mouthW: 0.04, mouthColor: '#8b3a3a' };
      case 'smug': return { browY: 0.06, browAngleL: 0.15, browAngleR: -0.05, mouthW: 0.06, mouthColor: '#a04040' };
      default: return { browY: 0.06, browAngleL: 0.08, browAngleR: -0.08, mouthW: 0.06, mouthColor: '#8b3a3a' };
    }
  }, [traits.expression]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const t = state.clock.elapsedTime;

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

    // Eyebrow expression animation
    if (leftBrowRef.current && rightBrowRef.current) {
      const browBounce = isTalking ? Math.sin(t * 3) * 0.02 : 0;
      leftBrowRef.current.position.y = expr.browY + browBounce;
      rightBrowRef.current.position.y = expr.browY + browBounce;
      leftBrowRef.current.rotation.z = THREE.MathUtils.lerp(leftBrowRef.current.rotation.z, expr.browAngleL + (isTalking ? Math.sin(t * 2.5) * 0.05 : 0), delta * 4);
      rightBrowRef.current.rotation.z = THREE.MathUtils.lerp(rightBrowRef.current.rotation.z, expr.browAngleR + (isTalking ? Math.sin(t * 2.5 + 1) * 0.05 : 0), delta * 4);
    }

    // Mouth animation
    if (mouthRef.current) {
      if (isTalking) {
        const mouthOpen = (Math.sin(t * 12) * 0.5 + 0.5) * 0.04 + 0.01;
        mouthRef.current.scale.y = 1 + mouthOpen * 15;
        mouthRef.current.scale.x = 1 + Math.sin(t * 8) * 0.15;
      } else {
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 1, delta * 10);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, traits.expression === 'happy' ? 1.3 : 1, delta * 10);
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
      {/* === TORSO (box/Minecraft style) === */}
      <Box args={[bw, bh, 0.3]} position={[0, torsoY, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={traits.shirt} />
      </Box>
      {/* Shirt stripe/accent detail */}
      {traits.hasStripe && (
        <Box args={[bw + 0.01, 0.06, 0.31]} position={[0, torsoY, 0]}>
          <meshStandardMaterial color={traits.shirtAccent} />
        </Box>
      )}
      {/* Collar detail */}
      <Box args={[0.18, 0.04, 0.06]} position={[0, torsoY + bh / 2 - 0.01, 0.15]}>
        <meshStandardMaterial color={traits.hasJacket ? traits.jacketColor : traits.shirtAccent} />
      </Box>

      {/* Jacket */}
      {traits.hasJacket && (
        <Box args={[bw + 0.06, bh - 0.05, 0.32]} position={[0, torsoY, 0]} castShadow>
          <meshStandardMaterial color={traits.jacketColor} />
        </Box>
      )}

      {/* Chain */}
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

      {/* === HEAD GROUP (box style) === */}
      <group position={[0, headY, 0]} ref={headRef} scale={[hs, hs, hs]}>
        {/* Head block */}
        <Box args={[0.28, 0.28, 0.28]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>

        {/* --- HAIR --- */}
        {traits.hairStyle === 'flat' && (
          <Box args={[0.3, 0.06, 0.3]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {traits.hairStyle === 'tall' && (
          <Box args={[0.29, 0.16, 0.29]} position={[0, 0.18, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {traits.hairStyle === 'mohawk' && (
          <Box args={[0.08, 0.2, 0.26]} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}
        {traits.hairStyle === 'side' && (<>
          <Box args={[0.3, 0.06, 0.3]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.06, 0.2, 0.28]} position={[-0.15, 0.05, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        </>)}
        {traits.hairStyle === 'long' && (<>
          <Box args={[0.3, 0.06, 0.3]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.3, 0.22, 0.06]} position={[0, 0, -0.15]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.06, 0.22, 0.22]} position={[-0.15, 0, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
          <Box args={[0.06, 0.22, 0.22]} position={[0.15, 0, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        </>)}
        {traits.hairStyle === 'afro' && (
          <Sphere args={[0.22, 8, 8]} position={[0, 0.1, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Sphere>
        )}
        {traits.hairStyle === 'buzz' && (
          <Box args={[0.29, 0.03, 0.29]} position={[0, 0.14, 0]} castShadow>
            <meshStandardMaterial color={traits.hairColor} />
          </Box>
        )}

        {/* --- FACE --- */}
        {/* Eye whites */}
        <Box args={[0.065, 0.05, 0.01]} position={[-0.06, 0.03, 0.14]}>
          <meshStandardMaterial color="#f5f5f5" emissive="#ffffff" emissiveIntensity={0.05} />
        </Box>
        <Box args={[0.065, 0.05, 0.01]} position={[0.06, 0.03, 0.14]}>
          <meshStandardMaterial color="#f5f5f5" emissive="#ffffff" emissiveIntensity={0.05} />
        </Box>
        {/* Pupils */}
        <Box name="leftEye" args={[0.035, 0.035, 0.01]} position={[-0.06, 0.03, 0.145]}>
          <meshStandardMaterial color={traits.eyeColor} />
        </Box>
        <Box name="rightEye" args={[0.035, 0.035, 0.01]} position={[0.06, 0.03, 0.145]}>
          <meshStandardMaterial color={traits.eyeColor} />
        </Box>
        {/* Eye shine (tiny white dot) */}
        <Box args={[0.012, 0.012, 0.005]} position={[-0.05, 0.04, 0.15]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </Box>
        <Box args={[0.012, 0.012, 0.005]} position={[0.07, 0.04, 0.15]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </Box>

        {/* Eyebrows (animated by expression) */}
        <Box ref={leftBrowRef} args={[0.07, 0.018, 0.015]} position={[-0.06, expr.browY, 0.14]} rotation={[0, 0, expr.browAngleL]}>
          <meshStandardMaterial color={traits.hairColor} />
        </Box>
        <Box ref={rightBrowRef} args={[0.07, 0.018, 0.015]} position={[0.06, expr.browY, 0.14]} rotation={[0, 0, expr.browAngleR]}>
          <meshStandardMaterial color={traits.hairColor} />
        </Box>

        {/* Nose */}
        <Box args={[0.04, 0.05, 0.05]} position={[0, -0.01, 0.16]} castShadow>
          <meshStandardMaterial color={traits.skin} />
        </Box>

        {/* Mouth (expression-aware) */}
        <Box ref={mouthRef} args={[expr.mouthW, 0.02, 0.01]} position={[0, -0.065, 0.14]}>
          <meshStandardMaterial color={expr.mouthColor} />
        </Box>
        {/* Smile lines for happy */}
        {traits.expression === 'happy' && (<>
          <Box args={[0.015, 0.025, 0.01]} position={[-0.045, -0.058, 0.14]} rotation={[0, 0, 0.3]}>
            <meshStandardMaterial color={expr.mouthColor} />
          </Box>
          <Box args={[0.015, 0.025, 0.01]} position={[0.045, -0.058, 0.14]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial color={expr.mouthColor} />
          </Box>
        </>)}
        {/* Frown for angry */}
        {traits.expression === 'angry' && (<>
          <Box args={[0.015, 0.02, 0.01]} position={[-0.03, -0.072, 0.14]} rotation={[0, 0, -0.25]}>
            <meshStandardMaterial color={expr.mouthColor} />
          </Box>
          <Box args={[0.015, 0.02, 0.01]} position={[0.03, -0.072, 0.14]} rotation={[0, 0, 0.25]}>
            <meshStandardMaterial color={expr.mouthColor} />
          </Box>
        </>)}
        {/* O-mouth for surprised */}
        {traits.expression === 'surprised' && (
          <Box args={[0.035, 0.04, 0.01]} position={[0, -0.065, 0.14]}>
            <meshStandardMaterial color={expr.mouthColor} />
          </Box>
        )}

        {/* Cheek blush */}
        {traits.hasCheekBlush && (<>
          <Box args={[0.05, 0.03, 0.01]} position={[-0.1, -0.02, 0.14]}>
            <meshStandardMaterial color="#e88080" transparent opacity={0.35} />
          </Box>
          <Box args={[0.05, 0.03, 0.01]} position={[0.1, -0.02, 0.14]}>
            <meshStandardMaterial color="#e88080" transparent opacity={0.35} />
          </Box>
        </>)}

        {/* Ears */}
        <Box args={[0.04, 0.06, 0.04]} position={[-0.16, 0, 0]}>
          <meshStandardMaterial color={traits.skin} />
        </Box>
        <Box args={[0.04, 0.06, 0.04]} position={[0.16, 0, 0]}>
          <meshStandardMaterial color={traits.skin} />
        </Box>

        {/* --- BEARD --- */}
        {traits.hasBeard && traits.beardStyle === 'full' && (
          <Box args={[0.24, 0.12, 0.14]} position={[0, -0.1, 0.06]} castShadow>
            <meshStandardMaterial color={traits.beardColor} />
          </Box>
        )}
        {traits.hasBeard && traits.beardStyle === 'goatee' && (
          <Box args={[0.08, 0.1, 0.08]} position={[0, -0.1, 0.08]} castShadow>
            <meshStandardMaterial color={traits.beardColor} />
          </Box>
        )}
        {traits.hasBeard && traits.beardStyle === 'stubble' && (
          <Box args={[0.22, 0.06, 0.06]} position={[0, -0.08, 0.1]}>
            <meshStandardMaterial color={traits.beardColor} transparent opacity={0.4} />
          </Box>
        )}

        {/* --- GLASSES --- */}
        {traits.hasGlasses && (
          <group position={[0, 0.03, 0.15]}>
            <Box args={[0.07, 0.045, 0.01]} position={[-0.06, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} transparent opacity={0.6} />
            </Box>
            <Box args={[0.07, 0.045, 0.01]} position={[0.06, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} transparent opacity={0.6} />
            </Box>
            <Box args={[0.03, 0.01, 0.01]} position={[0, 0, 0]}>
              <meshStandardMaterial color={traits.glassesColor} />
            </Box>
          </group>
        )}

        {/* --- HAT --- */}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'cap' && (
          <group position={[0, 0.18, 0]}>
            <Box args={[0.3, 0.1, 0.3]} castShadow>
              <meshStandardMaterial color={traits.hatColor} />
            </Box>
            <Box args={[0.3, 0.02, 0.14]} position={[0, -0.04, 0.2]} castShadow>
              <meshStandardMaterial color={traits.hatColor} />
            </Box>
          </group>
        )}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'beanie' && (
          <group position={[0, 0.16, 0]}>
            <Box args={[0.29, 0.12, 0.29]} castShadow>
              <meshStandardMaterial color={traits.hatColor} />
            </Box>
            <Sphere args={[0.03, 6, 6]} position={[0, 0.08, 0]}>
              <meshStandardMaterial color={traits.hatColor} />
            </Sphere>
          </group>
        )}
        {traits.hasHat && !traits.hasHeadband && traits.hatStyle === 'tophat' && (
          <group position={[0, 0.24, 0]}>
            <Box args={[0.26, 0.22, 0.26]} castShadow>
              <meshStandardMaterial color="#1a1a1a" />
            </Box>
            <Box args={[0.36, 0.02, 0.36]} position={[0, -0.11, 0]} castShadow>
              <meshStandardMaterial color="#1a1a1a" />
            </Box>
          </group>
        )}

        {/* --- HEADBAND --- */}
        {traits.hasHeadband && !traits.hasHat && (
          <Box args={[0.3, 0.04, 0.3]} position={[0, 0.1, 0]} castShadow>
            <meshStandardMaterial color={traits.headbandColor} />
          </Box>
        )}

        {/* --- EARRINGS --- */}
        {traits.hasEarrings && (<>
          <Sphere args={[0.015, 6, 6]} position={[-0.16, -0.04, 0]}>
            <meshStandardMaterial color={traits.earringColor} metalness={0.9} roughness={0.1} />
          </Sphere>
          <Sphere args={[0.015, 6, 6]} position={[0.16, -0.04, 0]}>
            <meshStandardMaterial color={traits.earringColor} metalness={0.9} roughness={0.1} />
          </Sphere>
        </>)}
      </group>

      {/* === LEGS (box style) === */}
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
      {/* Shoe accent stripe */}
      <Box args={[0.2, 0.015, 0.01]} position={[-0.12, 0.04, 0.14]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      <Box args={[0.2, 0.015, 0.01]} position={[0.12, 0.04, 0.14]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>

      {/* === LEFT ARM === */}
      <group ref={leftArmRef} position={[-(bw / 2 + 0.1), torsoY + bh / 2 - 0.1, 0]}>
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

      {/* === NAME + CAPTION CARD === */}
      {captionsEnabled && !isLeaving && (
        <Html position={[0, headY + 0.05, 0]} center zIndexRange={[100, 0]}>
          <div style={{ pointerEvents: 'none', userSelect: 'none', transform: 'translateY(-100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid #d5a24d',
              borderRadius: '6px',
              padding: displayedText ? '3px 20px 5px' : '3px 20px',
              minWidth: '180px',
              maxWidth: '420px',
              width: displayedText ? '400px' : 'auto',
              boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#ffcc4d',
                textAlign: 'center',
                lineHeight: 1.1,
              }}>{npc?.name ?? 'NPC'}</div>
              {displayedText && (
                <div style={{
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
                  fontSize: '17px',
                  fontWeight: 500,
                  color: '#ffffffee',
                  lineHeight: 1.25,
                  marginTop: '2px',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {displayedText}
                  <span style={{ opacity: 0.5, animation: 'blink 0.8s steps(2) infinite' }}>▌</span>
                </div>
              )}
            </div>
            {/* Arrow pointing down toward head */}
            <div style={{
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #d5a24d',
              marginTop: '-1px',
            }} />
          </div>
        </Html>
      )}
    </group>
  );
}
