import * as THREE from 'three';

// Adapted from the v0 "Book rendering design" template: the Sketchfab model ships
// without cover UVs, so we project the flat front/back faces onto the two halves
// of a side-by-side texture and leave the spine/edges sampling the texture edge.

const FRONT_DOT = 0.98;
const BACK_DOT = -0.98;
const MAX_XY_DEVIATION = 0.1;

// Duplicates vertices shared by cover and edge faces so each side can get its own UV.
function splitCoverEdgeSeam(geometry: THREE.BufferGeometry, coverMask: Uint8Array) {
  const pos = geometry.attributes.position;
  const index = geometry.index!;

  const posArr: number[] = [];
  const newIdx: number[] = [];
  const vertMap = new Map<number, number>();

  for (let i = 0; i < pos.count; i++) posArr.push(pos.getX(i), pos.getY(i), pos.getZ(i));

  for (let i = 0; i < index.count; i += 3) {
    const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
    const covers = ids.map((id) => coverMask[id] === 1);
    const faceIsCover = covers.every(Boolean);
    const faceIsEdge = !covers.some(Boolean);

    if (!faceIsCover && !faceIsEdge) {
      ids.forEach((id, k) => {
        if (coverMask[id] !== 0) {
          let dup = vertMap.get(id);
          if (dup === undefined) {
            dup = posArr.length / 3;
            vertMap.set(id, dup);
            posArr.push(pos.getX(id), pos.getY(id), pos.getZ(id));
          }
          ids[k] = dup;
        }
      });
    }
    newIdx.push(...ids);
  }

  const g2 = new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  g2.setIndex(newIdx);
  return g2;
}

export function generateUVForBothCovers(mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  if (!geometry.attributes.position) return;

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;

  const zRange = bbox.max.z - bbox.min.z;
  const frontZ = bbox.max.z - zRange * 0.05;
  const backZ = bbox.min.z + zRange * 0.05;
  const width = bbox.max.x - bbox.min.x;
  const height = bbox.max.y - bbox.min.y;

  const side = (n: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, p: typeof positions, i: number) => {
    const flat = Math.abs(n.getX(i)) < MAX_XY_DEVIATION && Math.abs(n.getY(i)) < MAX_XY_DEVIATION;
    if (flat && n.getZ(i) >= FRONT_DOT && p.getZ(i) >= frontZ) return 'front';
    if (flat && n.getZ(i) <= BACK_DOT && p.getZ(i) <= backZ) return 'back';
    return null;
  };

  const coverMask = new Uint8Array(positions.count);
  for (let i = 0; i < positions.count; i++) coverMask[i] = side(normals, positions, i) ? 1 : 0;

  const next = splitCoverEdgeSeam(geometry, coverMask);
  next.computeVertexNormals();
  const p = next.attributes.position;
  const n = next.attributes.normal;
  const uv = new Float32Array(p.count * 2);

  for (let i = 0; i < p.count; i++) {
    const s = side(n, p, i);
    const u = (p.getX(i) - bbox.min.x) / width;
    const v = (p.getY(i) - bbox.min.y) / height;
    uv[i * 2] = s === 'front' ? u * 0.5 : s === 'back' ? 0.5 + u * 0.5 : -10;
    uv[i * 2 + 1] = s ? v : -10;
  }

  next.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  mesh.geometry = next;
}
