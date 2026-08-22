import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

export interface LoadedGLTFModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  mixer?: THREE.AnimationMixer;
}

export function loadGLTFModel(
  source: string | File,
  onProgress?: (progress: number) => void
): Promise<LoadedGLTFModel> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    if (typeof source === 'string') {
      loader.load(
        source,
        (gltf) => {
          const model = gltf.scene;
          normalizeModel(model);
          resolve({
            scene: model,
            animations: gltf.animations || [],
          });
        },
        (xhr) => {
          if (xhr.lengthComputable && onProgress) {
            onProgress(xhr.loaded / xhr.total);
          }
        },
        (err) => {
          reject(err);
        }
      );
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result;
        if (contents) {
          loader.parse(
            contents as ArrayBuffer,
            '',
            (gltf) => {
              const model = gltf.scene;
              normalizeModel(model);
              resolve({
                scene: model,
                animations: gltf.animations || [],
              });
            },
            (err) => {
              reject(err);
            }
          );
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(source);
    }
  });
}

function normalizeModel(model: THREE.Group) {
  // Compute bounding box to scale & center properly at origin
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  // Target height ~1.75m in Three.js world units
  if (maxDim > 0) {
    const scale = 1.75 / maxDim;
    model.scale.set(scale, scale, scale);
  }

  // Re-compute bounding box after scale and place feet on ground plane (y = 0)
  const boxAfter = new THREE.Box3().setFromObject(model);
  model.position.y -= boxAfter.min.y;

  // Enable shadows and enhance PBR skin/cloth materials
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(enhanceMaterial);
        } else {
          enhanceMaterial(mesh.material);
        }
      }
    }
  });
}

function enhanceMaterial(mat: THREE.Material) {
  if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
    const standardMat = mat as THREE.MeshStandardMaterial;
    standardMat.roughness = Math.max(0.25, standardMat.roughness || 0.4);
    standardMat.metalness = Math.min(0.2, standardMat.metalness || 0.05);
    standardMat.needsUpdate = true;
  }
}
