'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Environment, TrackballControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// "Leather Book" by Smoggybeard on Sketchfab, CC BY 4.0:
// https://sketchfab.com/3d-models/leather-book-7d941f84245d4bafb7e94852aec9f02d
export const MODEL = '/models/leather-book.glb';

export interface SceneParams {
  rotation: [number, number, number];
  scale: number;
  cameraFov: number;
}

const CAMERA: [number, number, number] = [0, 0, 6];

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

function Book({ params, onReady }: { params: SceneParams; onReady: () => void }) {
  const { scene } = useGLTF(MODEL);

  // Centre the model on the origin and normalise it to a unit-ish size, whatever
  // scale and pivot it was authored with.
  const root = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    clone.position.sub(centre);
    const group = new THREE.Group();
    group.add(clone);
    group.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
    return group;
  }, [scene]);

  useEffect(() => {
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [root, onReady]);

  return (
    <group rotation={params.rotation} scale={params.scale}>
      <primitive object={root} />
    </group>
  );
}

export function BookScene({ params, onReady }: { params: SceneParams; onReady: () => void }) {
  return (
    <Canvas className="h-full w-full" camera={{ position: CAMERA, fov: params.cameraFov }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} />
        <directionalLight position={[-5, 3, 4]} intensity={0.5} color="#fff3d6" />
        <Environment preset="apartment" />
        <CameraFov fov={params.cameraFov} />
        <Book params={params} onReady={onReady} />
        <TrackballControls noPan noZoom staticMoving={false} dynamicDampingFactor={0.05} rotateSpeed={1.5} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
