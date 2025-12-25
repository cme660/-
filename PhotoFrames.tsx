
import React, { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Billboard, Text, useCursor } from '@react-three/drei';
import { TREE_CONFIG, COLORS } from '../constants';

interface PhotoFramesProps {
  progress: number;
  photoUrls: string[];
}

const PhotoFrame: React.FC<{ 
  pos: [number, number, number]; 
  chaosPos: [number, number, number];
  url: string | null; 
  progress: number;
}> = ({ pos, chaosPos, url, progress }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null!);
  useCursor(hovered);

  const texture = url ? useLoader(THREE.TextureLoader, url) : null;

  useFrame((state, delta) => {
    if (meshRef.current) {
      const lp = Math.pow(progress, 0.6);
      const x = THREE.MathUtils.lerp(chaosPos[0], pos[0], lp);
      const y = THREE.MathUtils.lerp(chaosPos[1], pos[1], lp);
      const z = THREE.MathUtils.lerp(chaosPos[2], pos[2], lp);
      meshRef.current.position.set(x, y, z);

      const targetScale = hovered ? 2.2 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    }
  });

  return (
    <group ref={meshRef}>
      <Billboard follow={true}>
        <mesh 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1.3, 1.7, 0.1]} />
          <meshStandardMaterial 
            color={COLORS.GOLD_HIGH} 
            metalness={1} 
            roughness={0.05} 
            emissive={COLORS.GOLD_BRIGHT}
            emissiveIntensity={hovered ? 0.4 : 0.1}
          />
        </mesh>
        
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.15, 1.55]} />
          {texture ? (
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
          ) : (
            <meshStandardMaterial color="#000802" metalness={0.8} roughness={0.2} />
          )}
        </mesh>

        {!texture && (
          <Text
            position={[0, 0, 0.07]}
            fontSize={0.09}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            maxWidth={1}
            textAlign="center"
            fillOpacity={0.8}
          >
            Memories of Gold
          </Text>
        )}
      </Billboard>
    </group>
  );
};

const PhotoFrames: React.FC<PhotoFramesProps> = ({ progress, photoUrls }) => {
  const framePositions = useMemo(() => {
    const data = [];
    const NUM_FRAMES = 6;
    
    for (let i = 0; i < NUM_FRAMES; i++) {
      const angle = (i / NUM_FRAMES) * Math.PI * 2 + (Math.random() - 0.5) * 1.2;
      const h = 1.5 + Math.random() * 5.5;
      const radiusAtH = (1 - h / TREE_CONFIG.HEIGHT) * TREE_CONFIG.RADIUS;
      const r = radiusAtH + 0.4 + Math.random() * 1.2;
      
      const targetPos: [number, number, number] = [
        Math.cos(angle) * r,
        h,
        Math.sin(angle) * r
      ];

      const cr = TREE_CONFIG.CHAOS_RADIUS; 
      const ct = Math.random() * Math.PI * 2;
      const cp = Math.acos(2 * Math.random() - 1);
      const chaosPos: [number, number, number] = [
        cr * Math.sin(cp) * Math.cos(ct),
        cr * Math.sin(cp) * Math.sin(ct) + 4,
        cr * Math.cos(cp)
      ];

      data.push({ targetPos, chaosPos });
    }
    return data;
  }, []);

  return (
    <group>
      {framePositions.map((pos, i) => (
        <PhotoFrame 
          key={i} 
          pos={pos.targetPos} 
          chaosPos={pos.chaosPos}
          url={photoUrls[i] || null} 
          progress={progress} 
        />
      ))}
    </group>
  );
};

export default PhotoFrames;
