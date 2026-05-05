import * as THREE from 'three';

export interface SectionTheme {
  leather: string; // cover colour
  foil: string; // lettering colour
  page: string; // background behind the book
}

// One binding per section, so neighbouring books read as a set on the shelf.
export const sectionThemes: Record<string, SectionTheme> = {
  Pentateuch: { leather: '#5a1d1a', foil: '#d9b25f', page: '#efe4d6' },
  History: { leather: '#20392c', foil: '#d4b36a', page: '#e5e9df' },
  Poetry: { leather: '#1d2b4b', foil: '#d8bd7a', page: '#e3e6ee' },
  'Major Prophets': { leather: '#3d2748', foil: '#d6b56d', page: '#ebe3ec' },
  'Minor Prophets': { leather: '#4b3620', foil: '#e0c07c', page: '#efe8dc' },
  Deuterocanon: { leather: '#2b2b2d', foil: '#c9ad6e', page: '#e7e5e0' },
  'Gospels & Acts': { leather: '#6d1f22', foil: '#e2bf6c', page: '#f1e3df' },
  Epistles: { leather: '#1c3b43', foil: '#d3b673', page: '#e0e9e9' },
  Revelation: { leather: '#141414', foil: '#d9b25f', page: '#e4e1db' },
};

export const themeFor = (section: string) => sectionThemes[section] ?? sectionThemes.Deuterocanon;

const W = 1024;
const H = 1400;

function cssFont(variable: string, fallback: string) {
  const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return family || fallback;
}

// Breaks a title onto as many lines as it needs at the given size.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}

function leather(ctx: CanvasRenderingContext2D, x: number, colour: string) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, 0, W, H);

  // Soft light falloff plus a little grain so it doesn't look like flat plastic.
  const shade = ctx.createRadialGradient(x + W * 0.45, H * 0.35, 80, x + W / 2, H / 2, H * 0.8);
  shade.addColorStop(0, 'rgba(255,255,255,0.10)');
  shade.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, 0, W, H);

  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(x + Math.random() * W, Math.random() * H, 2, 2);
  }
}

function border(ctx: CanvasRenderingContext2D, x: number, foil: string) {
  ctx.strokeStyle = foil;
  ctx.lineWidth = 6;
  ctx.strokeRect(x + 70, 70, W - 140, H - 140);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 90, 90, W - 180, H - 180);
}

function cross(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, foil: string) {
  ctx.fillStyle = foil;
  const t = size * 0.14;
  ctx.fillRect(cx - t / 2, cy - size / 2, t, size);
  ctx.fillRect(cx - size * 0.32, cy - size * 0.22, size * 0.64, t);
}

/**
 * Draws the front cover on the left half and the back cover on the right half,
 * matching the UV layout that generateUVForBothCovers puts on the model.
 */
export function drawCoverTexture(book: { title: string; section: string; testament: string }) {
  const { leather: colour, foil } = themeFor(book.section);
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const display = cssFont('--font-playfair', 'Georgia, serif');
  const body = cssFont('--font-garamond', 'Georgia, serif');

  // Front
  leather(ctx, 0, colour);
  border(ctx, 0, foil);
  ctx.fillStyle = foil;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `500 44px ${body}`;
  ctx.fillText(book.testament.toUpperCase().split('').join(' '), W / 2, 230);

  let size = 150;
  ctx.font = `700 ${size}px ${display}`;
  let lines = wrap(ctx, book.title, W - 260);
  while ((lines.length > 3 || lines.some((l) => ctx.measureText(l).width > W - 260)) && size > 60) {
    size -= 8;
    ctx.font = `700 ${size}px ${display}`;
    lines = wrap(ctx, book.title, W - 260);
  }
  const lineHeight = size * 1.12;
  const top = H * 0.46 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, top + i * lineHeight));

  ctx.fillRect(W / 2 - 90, top + (lines.length - 1) * lineHeight + size * 0.75, 180, 3);

  ctx.font = `italic 400 46px ${body}`;
  ctx.fillText(book.section, W / 2, H - 290);
  ctx.font = `500 34px ${body}`;
  ctx.fillText('K I N G   J A M E S   V E R S I O N', W / 2, H - 200);

  // Back
  leather(ctx, W, colour);
  border(ctx, W, foil);
  cross(ctx, W + W / 2, H / 2, 220, foil);

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
