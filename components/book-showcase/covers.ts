import * as THREE from 'three';

const W = 1024;
const H = 1400;
const LEATHER = '#141312';
const GOLD = '#c8a45c';

function cssFont(variable: string, fallback: string) {
  const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return family || fallback;
}

function leather(ctx: CanvasRenderingContext2D, x: number) {
  ctx.fillStyle = LEATHER;
  ctx.fillRect(x, 0, W, H);

  // A soft sheen and fine grain; kept faint so it reads as leather, not texture.
  const sheen = ctx.createRadialGradient(x + W * 0.4, H * 0.3, 60, x + W / 2, H / 2, H * 0.85);
  sheen.addColorStop(0, 'rgba(255,255,255,0.06)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, 0, W, H);

  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.04)';
    ctx.fillRect(x + Math.random() * W, Math.random() * H, 2, 2);
  }
}

/**
 * Front cover on the left half, back cover on the right half, matching the UV
 * layout generateUVForBothCovers puts on the model.
 */
export function drawBibleCover() {
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const display = cssFont('--font-playfair', 'Georgia, serif');

  leather(ctx, 0);
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 64px ${display}`;
  ctx.fillText('H O L Y   B I B L E', W / 2, 300);

  leather(ctx, W);

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
