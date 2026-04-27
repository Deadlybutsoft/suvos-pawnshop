import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    // Position camera behind the counter
    camera.position.set(0, 1.6, -2.5)
    // Look towards Wall 1 (front entrance)
    camera.lookAt(0, 1.6, 4)
  }, [camera])
  return null
}
