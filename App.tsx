
import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, Loader } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import Scene from './components/Scene';
import { TreeState } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const toggleState = () => {
    setTreeState((prev) => (prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const urls = files.map(file => URL.createObjectURL(file as File));
      setPhotoUrls(prev => [...urls, ...prev].slice(0, 6));
    }
  };

  return (
    <div className="w-full h-screen relative bg-[#000400]">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-none flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-serif text-[#D4AF37] drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)] tracking-widest uppercase mb-2">
          Grand Luxury
        </h1>
        <p className="text-[#FFD700] text-sm md:text-lg italic tracking-widest opacity-80">
          The Definitive Holiday Interactive Experience
        </p>
      </div>

      <div className="absolute bottom-10 left-0 w-full z-10 flex justify-center items-center gap-6 px-4">
        <button
          onClick={toggleState}
          className="pointer-events-auto px-8 py-3 bg-[#002d1a] text-[#D4AF37] border-2 border-[#D4AF37] rounded-full font-bold hover:bg-[#D4AF37] hover:text-[#002d1a] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] uppercase tracking-widest text-sm"
        >
          {treeState === TreeState.CHAOS ? "Form The Tree" : "Engage Chaos"}
        </button>

        <label className="pointer-events-auto cursor-pointer px-8 py-3 bg-black text-[#D4AF37] border border-[#D4AF37] rounded-full font-bold hover:bg-[#D4AF37] hover:text-black transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] uppercase tracking-widest text-sm text-center">
          Upload Memories
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* 3D Scene */}
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <color attach="background" args={['#000200']} />
        <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={45} />
        
        <Suspense fallback={null}>
          <Scene treeState={treeState} photoUrls={photoUrls} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1.0} />
          <Environment preset="night" />
          
          <EffectComposer disableNormalPass>
            <Bloom 
              intensity={0.8} 
              luminanceThreshold={0.8} 
              luminanceSmoothing={0.9} 
              mipmapBlur 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={5} 
          maxDistance={35}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
      
      <Loader />
    </div>
  );
};

export default App;
