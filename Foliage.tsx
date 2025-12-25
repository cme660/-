
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, COLORS } from '../constants';

interface FoliageProps {
  progress: number;
}

const Foliage: React.FC<FoliageProps> = ({ progress }) => {
  const meshRef = useRef<THREE.Points>(null!);

  const { chaosPositions, targetPositions, sizes } = useMemo(() => {
    const chaosPos = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const targetPos = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT * 3);
    const sizes = new Float32Array(TREE_CONFIG.FOLIAGE_COUNT);

    const SPIRAL_ARMS = 4;
    const WINDINGS = 5.0;

    for (let i = 0; i < TREE_CONFIG.FOLIAGE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 2.5) * TREE_CONFIG.CHAOS_RADIUS; 
      chaosPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 3.5;
      chaosPos[i * 3 + 2] = r * Math.cos(phi);

      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const radiusAtH = (1 - h / TREE_CONFIG.HEIGHT) * TREE_CONFIG.RADIUS;
      const armIndex = i % SPIRAL_ARMS;
      const angle = (h / TREE_CONFIG.HEIGHT) * Math.PI * 2 * WINDINGS + (armIndex * (Math.PI * 2 / SPIRAL_ARMS)) + (Math.random() - 0.5) * 1.0;
      
      const thickness = (Math.random() - 0.5) * 0.7 * (1.0 - h / TREE_CONFIG.HEIGHT);
      const currentRadius = radiusAtH + thickness;

      targetPos[i * 3] = currentRadius * Math.cos(angle);
      targetPos[i * 3 + 1] = h;
      targetPos[i * 3 + 2] = currentRadius * Math.sin(angle);

      sizes[i] = Math.random() * 0.06 + 0.025;
    }
    return { chaosPositions: chaosPos, targetPositions: targetPos, sizes };
  }, []);

  const uniforms = useMemo(() => ({
    uProgress: { value: progress },
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uProgress.value = progress;
      mat.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={chaosPositions.length / 3}
          array={chaosPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-targetPosition"
          count={targetPositions.length / 3}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute vec3 targetPosition;
          attribute float size;
          uniform float uProgress;
          uniform float uTime;
          varying vec3 vColor;

          void main() {
            vec3 currentPos = mix(position, targetPosition, uProgress);
            
            float swayStrength = (1.0 - uProgress) * 0.2 + 0.08;
            currentPos.x += sin(uTime * 1.5 + currentPos.y * 0.8) * swayStrength;
            currentPos.z += cos(uTime * 1.6 + currentPos.y * 0.8) * swayStrength;

            vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
            gl_PointSize = size * (500.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            
            vec3 neonGreen = vec3(0.0, 1.0, 0.4); 
            vec3 richEmerald = vec3(0.0, 0.6, 0.2); 
            vec3 glowGold = vec3(1.0, 0.9, 0.4); 
            
            float t = sin(currentPos.y * 3.0 + uTime * 2.0) * 0.5 + 0.5;
            vec3 baseColor = mix(richEmerald, neonGreen, t);
            vColor = mix(baseColor, glowGold, pow(uProgress, 2.5) * 0.4);
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
      />
    </points>
  );
};

export default Foliage;
