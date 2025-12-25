
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, COLORS, WEIGHTS } from '../constants';
import { OrnamentData } from '../types';

interface OrnamentsProps {
  progress: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const ballRef = useRef<THREE.InstancedMesh>(null!);
  const giftRef = useRef<THREE.InstancedMesh>(null!);
  const lightRef = useRef<THREE.InstancedMesh>(null!);

  const ornamentData = useMemo(() => {
    const balls: OrnamentData[] = [];
    const gifts: OrnamentData[] = [];
    const lights: OrnamentData[] = [];

    for (let i = 0; i < TREE_CONFIG.ORNAMENT_COUNT; i++) {
      const type = Math.random();
      const h = Math.random() * TREE_CONFIG.HEIGHT;
      const radiusAtH = (1 - h / TREE_CONFIG.HEIGHT) * TREE_CONFIG.RADIUS;
      const angle = Math.random() * Math.PI * 2;
      
      const targetPos: [number, number, number] = [
        radiusAtH * Math.cos(angle),
        h,
        radiusAtH * Math.sin(angle)
      ];

      const r = Math.pow(Math.random(), 2.0) * TREE_CONFIG.CHAOS_RADIUS;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const chaosPos: [number, number, number] = [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) + 3.5,
        r * Math.cos(phi)
      ];

      if (type < 0.4) {
        balls.push({ id: i, chaosPosition: chaosPos, targetPosition: targetPos, weight: WEIGHTS.BALL, color: i % 2 === 0 ? COLORS.GOLD_HIGH : COLORS.BALL_PURPLE });
      } else if (type < 0.7) {
        gifts.push({ id: i, chaosPosition: chaosPos, targetPosition: targetPos, weight: WEIGHTS.GIFT, color: i % 2 === 0 ? COLORS.GIFT_RED : COLORS.GIFT_BLUE });
      } else {
        lights.push({ id: i, chaosPosition: chaosPos, targetPosition: targetPos, weight: WEIGHTS.LIGHT, color: COLORS.GOLD_BRIGHT });
      }
    }
    return { balls, gifts, lights };
  }, []);

  const tempObject = new THREE.Object3D();

  useFrame(() => {
    const updateInstances = (mesh: THREE.InstancedMesh, data: OrnamentData[]) => {
      data.forEach((item, i) => {
        const lagProgress = Math.pow(progress, 1 / item.weight);
        const x = THREE.MathUtils.lerp(item.chaosPosition[0], item.targetPosition[0], lagProgress);
        const y = THREE.MathUtils.lerp(item.chaosPosition[1], item.targetPosition[1], lagProgress);
        const z = THREE.MathUtils.lerp(item.chaosPosition[2], item.targetPosition[2], lagProgress);
        
        tempObject.position.set(x, y, z);
        tempObject.scale.setScalar(0.8 + lagProgress * 0.4); 
        
        tempObject.updateMatrix();
        mesh.setMatrixAt(i, tempObject.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    if (ballRef.current) updateInstances(ballRef.current, ornamentData.balls);
    if (giftRef.current) updateInstances(giftRef.current, ornamentData.gifts);
    if (lightRef.current) updateInstances(lightRef.current, ornamentData.lights);
  });

  return (
    <>
      <instancedMesh ref={ballRef} args={[undefined, undefined, ornamentData.balls.length]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial metalness={1} roughness={0.05} color={COLORS.GOLD_HIGH} />
      </instancedMesh>

      <instancedMesh ref={giftRef} args={[undefined, undefined, ornamentData.gifts.length]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial metalness={0.7} roughness={0.3} color={COLORS.GIFT_RED} />
      </instancedMesh>

      <instancedMesh ref={lightRef} args={[undefined, undefined, ornamentData.lights.length]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial emissive={COLORS.GOLD_BRIGHT} emissiveIntensity={5} color={COLORS.GOLD_BRIGHT} />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
