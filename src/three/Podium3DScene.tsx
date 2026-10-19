import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LeaderboardEntry } from '../types.ts';

interface Podium3DSceneProps {
  topThree: LeaderboardEntry[];
}

export const Podium3DScene: React.FC<Podium3DSceneProps> = ({ topThree }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x100a1c, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.5, 6.2);

    const isHeadless = typeof navigator !== 'undefined' && (/HeadlessChrome/i.test(navigator.userAgent) || navigator.webdriver);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Sacred Temple Lights
    const keyLight = new THREE.DirectionalLight(0xffedd5, 3.2); // Warm golden diya light
    keyLight.position.set(2, 6, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.4); // Deep saffron rim
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.6); // Yamuna blue reflection
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xfef08a, 0x2e1065, 0.9);
    scene.add(hemiLight);

    // Temple Lotus Floor
    const floorGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.2, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2d1810, // Sandalwood & bronze temple floor
      roughness: 0.25,
      metalness: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.1;
    scene.add(floorMesh);

    // Glowing Saffron & Gold Ring
    const ringGeo = new THREE.TorusGeometry(3.65, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // 3 Sacred Pedestals:
    // 1st Place (Center: Pure Gold Maha-Bhagavata)
    // 2nd Place (Left: Divine Silver Uttama)
    // 3rd Place (Right: Temple Bronze Madhyama)
    const podiumData = [
      { rank: 1, x: 0, height: 1.6, color: 0xfbbf24, label: 'MAHA-BHAGAVATA #1' },
      { rank: 2, x: -1.75, height: 1.1, color: 0xe2e8f0, label: 'UTTAMA #2' },
      { rank: 3, x: 1.75, height: 0.75, color: 0xd97706, label: 'MADHYAMA #3' },
    ];

    const trophies: THREE.Mesh[] = [];

    podiumData.forEach((p) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(p.x, p.height / 2, 0);

      // Pedestal Cylinder
      const cylGeo = new THREE.CylinderGeometry(0.65, 0.7, p.height, 32);
      const cylMat = new THREE.MeshPhysicalMaterial({
        color: p.color,
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 0.85,
      });
      const cylMesh = new THREE.Mesh(cylGeo, cylMat);
      pGroup.add(cylMesh);

      // Lotus Petal Trim around top of pedestal
      const trimGeo = new THREE.TorusGeometry(0.66, 0.03, 12, 32);
      const trimMat = new THREE.MeshBasicMaterial({ color: p.color });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.rotation.x = Math.PI / 2;
      trim.position.y = p.height / 2 - 0.02;
      pGroup.add(trim);

      // Sacred Floating Symbol (Kalash / Gem / Lotus)
      const trophyGeo = p.rank === 1
        ? new THREE.OctahedronGeometry(0.26, 0) // Radiant Diamond Jewel
        : p.rank === 2
        ? new THREE.DodecahedronGeometry(0.22, 0) // Sacred Gem
        : new THREE.TetrahedronGeometry(0.22, 0);

      const trophyMat = new THREE.MeshPhysicalMaterial({
        color: p.color,
        metalness: 0.95,
        roughness: 0.1,
        emissive: p.color,
        emissiveIntensity: 0.4,
        clearcoat: 1.0,
      });

      const trophyMesh = new THREE.Mesh(trophyGeo, trophyMat);
      trophyMesh.position.set(0, p.height / 2 + 0.45, 0);
      pGroup.add(trophyMesh);
      trophies.push(trophyMesh);

      scene.add(pGroup);
    });

    // Golden & Rose Flower Petals Shower
    const petalCount = 140;
    const petalGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(petalCount * 3);
    const petalSpeeds: number[] = [];

    for (let i = 0; i < petalCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      petalSpeeds.push(0.006 + Math.random() * 0.012);
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xf59e0b, // Golden marigold petal glow
      size: 0.07,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.02;

      trophies.forEach((tr, idx) => {
        tr.rotation.y += 0.02 * (idx === 0 ? 1.5 : 1);
        tr.rotation.x = Math.sin(t + idx) * 0.15;
        tr.position.y = podiumData[idx].height / 2 + 0.45 + Math.sin(t * 1.5 + idx) * 0.06;
      });

      camera.position.x = Math.sin(t * 0.2) * 0.4;
      camera.position.y = 2.4 + Math.cos(t * 0.2) * 0.15;
      camera.lookAt(0, 1.2, 0);

      const posAttr = petalGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < petalCount; i++) {
        arr[i * 3 + 1] -= petalSpeeds[i];
        if (arr[i * 3 + 1] < -0.2) {
          arr[i * 3 + 1] = 4.2;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="relative w-full h-[340px] md:h-[400px] select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c112e]/80 via-[#120a20]/90 to-[#08070e] border border-amber-500/30 shadow-2xl">
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Vedic Titles above Pedestals */}
      <div className="absolute inset-0 pointer-events-none flex items-start justify-between px-6 pt-4 max-w-2xl mx-auto">
        {/* 2nd Place */}
        <div className="flex flex-col items-center w-1/3 transform translate-y-12">
          {second ? (
            <div className="bg-[#170e28]/95 border border-slate-300/40 rounded-2xl px-3 py-2 text-center shadow-lg backdrop-blur-sm animate-fade-in">
              <span className="text-2xl">{second.avatar || '🦚'}</span>
              <div className="text-xs font-bold text-amber-100 truncate max-w-[100px]">
                {second.fullName}
              </div>
              <div className="text-[11px] font-mono text-amber-300/90 font-semibold">
                {second.score.toLocaleString()} pts
              </div>
              <span className="inline-block mt-1 text-[10px] bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded-full font-bold">
                🥈 Uttama Adhikari #2
              </span>
            </div>
          ) : (
            <div className="text-xs text-amber-500/40 font-mono">Empty</div>
          )}
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center w-1/3 transform -translate-y-1">
          {first ? (
            <div className="bg-gradient-to-b from-amber-500/30 via-[#201438]/95 to-[#120a20]/95 border-2 border-amber-400 rounded-2xl px-4 py-2.5 text-center shadow-2xl shadow-amber-500/25 backdrop-blur-md animate-bounce-subtle">
              <div className="text-3xl mb-1 filter drop-shadow">{first.avatar || '👑'}</div>
              <div className="text-sm font-black text-amber-300 truncate max-w-[120px]">
                {first.fullName}
              </div>
              <div className="text-xs font-mono text-amber-200 font-bold">
                {first.score.toLocaleString()} pts
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                👑 Maha-Bhagavata #1
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-500/40 font-mono">Empty</div>
          )}
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center w-1/3 transform translate-y-20">
          {third ? (
            <div className="bg-[#170e28]/95 border border-amber-700/50 rounded-2xl px-3 py-2 text-center shadow-lg backdrop-blur-sm animate-fade-in">
              <span className="text-2xl">{third.avatar || '🪷'}</span>
              <div className="text-xs font-bold text-amber-100 truncate max-w-[100px]">
                {third.fullName}
              </div>
              <div className="text-[11px] font-mono text-amber-400 font-semibold">
                {third.score.toLocaleString()} pts
              </div>
              <span className="inline-block mt-1 text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full font-bold">
                🥉 Madhyama #3
              </span>
            </div>
          ) : (
            <div className="text-xs text-amber-500/40 font-mono">Empty</div>
          )}
        </div>
      </div>
    </div>
  );
};
