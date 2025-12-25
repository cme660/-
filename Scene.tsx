
import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import PhotoFrames from './PhotoFrames';
import { TreeState } from '../types';
import { TREE_CONFIG } from '../constants';

interface SceneProps {
  treeState: TreeState;
  photoUrls: string[];
}

const Scene: React.FC<SceneProps> = ({ treeState, photoUrls }) => {
  const [progress, setProgress] = React.useState(treeState === TreeState.FORMED ? 1 : 0);

  useFrame((state, delta) => {
    const target = treeState === TreeState.FORMED ? 1 : 0;
    const step = delta * 1.2; 
    if (Math.abs(progress - target) > 0.001) {
      setProgress((p) => p + (target - p) * step * 4);
    } else {
      setProgress(target);
    }
  });

  return (
    <group position={[0, -4, 0]}>
      <ambientLight intensity={0.3} /> 
      <spotLight position={[15, 25, 15]} angle={0.3} penumbra={1} intensity={4} color="#FFD700" castShadow />
      <pointLight position={[-8, 8, -8]} intensity={2} color="#00FF41" /> 
      <pointLight position={[0, 4, 0]} intensity={1} color="#FFFFFF" />
      
      <Foliage progress={progress} />
      <Ornaments progress={progress} />
      <PhotoFrames progress={progress} photoUrls={photoUrls} />
      
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          color="#000400" 
          roughness={0.05} 
          metalness={0.9}
          emissive="#003314"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

export default Scene;
