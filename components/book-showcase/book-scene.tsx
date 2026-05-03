'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, TrackballControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { generateUVForBothCovers } from './uv';

export interface SceneParams {
  rotation: [number, number, number];
  scale: number;
  cameraFov: number;
}

const POSITION: [number, number, number] = [-3, -3, -3];
const CAMERA: [number, number, number] = [-4.2, -2.9, 0.4];

function CameraFov({ fov }: { fov: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    // three.js objects are mutable by design; r3f expects us to update them in place.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, fov]);
  return null;
}

function Book({
  params,
  texture,
  onReady,
}: {
  params: SceneParams;
  texture: THREE.Texture | null;
  onReady: () => void;
}) {
  const { scene } = useGLTF('/book.glb');

  // Clone once and bake cover UVs onto the clone, leaving the cached GLTF untouched.
  const { root, cover } = useMemo(() => {
    const root = scene.clone(true);
    const mesh = root.getObjectByName('Object_2') as THREE.Mesh | undefined;
    if (mesh) {
      mesh.geometry = mesh.geometry.clone();
      generateUVForBothCovers(mesh);
      const base = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const material = (base as THREE.MeshStandardMaterial).clone();
      material.color.set('#ffffff');
      material.metalness = 0.25;
      material.roughness = 0.85;
      material.emissive.set('#000000');
      // The rebuilt geometry has no COLOR_0 attribute; leaving this on renders black.
      material.vertexColors = false;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1;
      material.polygonOffsetUnits = -1;
      mesh.material = material;
    }
    return { root, cover: mesh };
  }, [scene]);

  useEffect(() => {
    if (!cover || !texture) return;
    const material = cover.material as THREE.MeshStandardMaterial;
    // eslint-disable-next-line react-hooks/immutability
    material.map = texture;
    material.needsUpdate = true;
  }, [cover, texture]);

  const reported = useRef(false);
  useFrame(() => {
    if (!reported.current && texture) {
      reported.current = true;
      onReady();
    }
  });

  return (
    <primitive
      object={root}
      scale={params.scale}
      position={POSITION}
      rotation={params.rotation}
    />
  );
}

export function BookScene({
  params,
  texture,
  onReady,
}: {
  params: SceneParams;
  texture: THREE.Texture | null;
  onReady: () => void;
}) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: CAMERA, fov: params.cameraFov }}
      dpr={[1, 2]}
      legacy
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-5, 8, 10]} intensity={0.8} color="#fffacd" />
        <Environment preset="sunset" />
        <CameraFov fov={params.cameraFov} />
        <Book params={params} texture={texture} onReady={onReady} />
        <TrackballControls
          noPan
          noZoom
          staticMoving={false}
          dynamicDampingFactor={0.05}
          rotateSpeed={1.5}
          target={POSITION}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload('/book.glb');
