/**
 * Procedural Vector Flower Sprite Generator & Cache
 * Pre-renders 10 distinct, beautifully detailed flower varieties onto offscreen canvases.
 * 
 * Optimized for CPU-only systems:
 * Rendering pre-drawn offscreen bitmaps via drawImage is much faster
 * than font emoji fillText or real-time complex vector paths per frame.
 */

export const SPRITE_SIZE = 120; // 120x120 pixels for high-DPI crisp rendering

export interface FlowerTypeInfo {
  name: string;
  palette: string;
}

export const FLOWER_TYPES: FlowerTypeInfo[] = [
  { name: 'Sakura / Cherry Blossom', palette: '#ffb7c5' },
  { name: 'Golden Sunflower', palette: '#ffcc00' },
  { name: 'Blush Peony', palette: '#ffc2d1' },
  { name: 'Neon Cyan Lotus', palette: '#00f5ff' },
  { name: 'Tropical Hibiscus', palette: '#ff3b5c' },
  { name: 'Soft Hydrangea', palette: '#b8c0ff' },
  { name: 'Soft Peach Dahlia', palette: '#ffcdb2' },
  { name: 'Bright Daisy', palette: '#ffffff' },
  { name: 'Cream Camellia', palette: '#fbf8cc' },
  { name: 'Lavender Cosmos', palette: '#c77dff' },
];

/**
 * Pre-renders all 10 flower graphics into offscreen canvases.
 */
export function generateFlowerSprites(): HTMLCanvasElement[] {
  const sprites: HTMLCanvasElement[] = [];

  for (let i = 0; i < FLOWER_TYPES.length; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawFlowerByIndex(ctx, i, SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE * 0.45);
    }
    sprites.push(canvas);
  }

  return sprites;
}

function drawFlowerByIndex(
  ctx: CanvasRenderingContext2D,
  index: number,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();

  switch (index) {
    case 0:
      drawSakura(ctx, cx, cy, r);
      break;
    case 1:
      drawSunflower(ctx, cx, cy, r);
      break;
    case 2:
      drawRose(ctx, cx, cy, r);
      break;
    case 3:
      drawLotus(ctx, cx, cy, r);
      break;
    case 4:
      drawHibiscus(ctx, cx, cy, r);
      break;
    case 5:
      drawOrchid(ctx, cx, cy, r);
      break;
    case 6:
      drawDahlia(ctx, cx, cy, r);
      break;
    case 7:
      drawDaisy(ctx, cx, cy, r);
      break;
    case 8:
      drawWaterLily(ctx, cx, cy, r);
      break;
    case 9:
      drawCosmos(ctx, cx, cy, r);
      break;
    default:
      drawSakura(ctx, cx, cy, r);
      break;
  }

  ctx.restore();
}

/* ── 1. SAKURA (CHERRY BLOSSOM) ────────────────────────────────────────── */
function drawSakura(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const numPetals = 5;
  for (let i = 0; i < numPetals; i++) {
    const angle = (i * 2 * Math.PI) / numPetals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Petal body with tip notch
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.4, -r * 0.4, -r * 0.5, -r * 0.95, -r * 0.1, -r);
    // V-notch at top
    ctx.lineTo(0, -r * 0.88);
    ctx.lineTo(r * 0.1, -r);
    ctx.bezierCurveTo(r * 0.5, -r * 0.95, r * 0.4, -r * 0.4, 0, 0);

    const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, -r * 0.5, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#ffc0cb');
    grad.addColorStop(1, '#ff69b4');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 105, 180, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Stamen center
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = '#fff0f5';
  ctx.fill();

  for (let s = 0; s < 12; s++) {
    const sAngle = (s * 2 * Math.PI) / 12;
    const sx = cx + Math.cos(sAngle) * r * 0.25;
    const sy = cy + Math.sin(sAngle) * r * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = '#e65c9c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
  }
}

/* ── 2. GOLDEN SUNFLOWER ────────────────────────────────────────────────── */
function drawSunflower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const petals = 18;
  for (let ring = 0; ring < 2; ring++) {
    const ringRadius = ring === 0 ? r : r * 0.88;
    const offset = ring === 0 ? 0 : Math.PI / petals;
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals + offset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-ringRadius * 0.25, -ringRadius * 0.4, -ringRadius * 0.25, -ringRadius * 0.8, 0, -ringRadius);
      ctx.bezierCurveTo(ringRadius * 0.25, -ringRadius * 0.8, ringRadius * 0.25, -ringRadius * 0.4, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, 0, -ringRadius);
      if (ring === 0) {
        grad.addColorStop(0, '#ff8c00');
        grad.addColorStop(0.5, '#ffa500');
        grad.addColorStop(1, '#ffea00');
      } else {
        grad.addColorStop(0, '#d97706');
        grad.addColorStop(0.6, '#f59e0b');
        grad.addColorStop(1, '#fef08a');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();
    }
  }

  // Large textured seed disc center
  const centerR = r * 0.42;
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
  centerGrad.addColorStop(0, '#543310');
  centerGrad.addColorStop(0.7, '#2c1802');
  centerGrad.addColorStop(1, '#1a0d01');
  ctx.fillStyle = centerGrad;
  ctx.fill();

  // Spiral seed stipple texture
  const totalSeeds = 60;
  const goldenRatio = 1.61803398875;
  for (let s = 1; s <= totalSeeds; s++) {
    const sR = Math.sqrt(s / totalSeeds) * (centerR - 2);
    const sAngle = s * goldenRatio * Math.PI * 2;
    const sx = cx + Math.cos(sAngle) * sR;
    const sy = cy + Math.sin(sAngle) * sR;

    ctx.beginPath();
    ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = s % 3 === 0 ? '#d97706' : '#854d0e';
    ctx.fill();
  }
}

/* ── 3. BLUSH PEONY (PETALY SOFT PASTEL PINK) ────────────────────────── */
function drawRose(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Layer 1: Outer 6 wide ruffled petals
  const outerPetals = 6;
  for (let i = 0; i < outerPetals; i++) {
    const angle = (i * 2 * Math.PI) / outerPetals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.55, -r * 0.35, -r * 0.45, -r * 0.95, -r * 0.15, -r * 0.98);
    ctx.bezierCurveTo(0, -r * 0.9, r * 0.15, -r * 0.98, r * 0.45, -r * 0.95);
    ctx.bezierCurveTo(r * 0.55, -r * 0.35, 0, 0, 0, 0);

    const g = ctx.createLinearGradient(0, 0, 0, -r);
    g.addColorStop(0, '#ffb3c6');
    g.addColorStop(0.6, '#ffe5ec');
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 143, 171, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Layer 2: Inner 5 overlapping wavy petals
  const innerPetals = 5;
  for (let i = 0; i < innerPetals; i++) {
    const angle = (i * 2 * Math.PI) / innerPetals + Math.PI / 5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const inR = r * 0.72;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-inR * 0.5, -inR * 0.3, -inR * 0.4, -inR * 0.95, 0, -inR);
    ctx.bezierCurveTo(inR * 0.4, -inR * 0.95, inR * 0.5, -inR * 0.3, 0, 0);

    const g = ctx.createLinearGradient(0, 0, 0, -inR);
    g.addColorStop(0, '#fb6f92');
    g.addColorStop(0.5, '#ff8fab');
    g.addColorStop(1, '#ffe5ec');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // Layer 3: Center fluffy ruffled cup
  const centerPetals = 4;
  for (let i = 0; i < centerPetals; i++) {
    const angle = (i * 2 * Math.PI) / centerPetals + Math.PI / 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const cR = r * 0.45;
    ctx.beginPath();
    ctx.arc(0, -cR * 0.3, cR * 0.5, 0, Math.PI);
    ctx.fillStyle = '#ffb3c6';
    ctx.fill();

    ctx.restore();
  }

  // Center warm gold stamen dots
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe0b2';
  ctx.fill();
}

/* ── 4. NEON CYAN LOTUS ────────────────────────────────────────────────── */
function drawLotus(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const petals = 12;

  for (let ring = 0; ring < 2; ring++) {
    const ringR = ring === 0 ? r * 0.95 : r * 0.72;
    const offset = ring === 0 ? 0 : Math.PI / petals;
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals + offset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-ringR * 0.4, -ringR * 0.6, 0, -ringR);
      ctx.quadraticCurveTo(ringR * 0.4, -ringR * 0.6, 0, 0);

      const g = ctx.createLinearGradient(0, 0, 0, -ringR);
      if (ring === 0) {
        g.addColorStop(0, '#003366');
        g.addColorStop(0.5, '#0088cc');
        g.addColorStop(1, '#00f5ff');
      } else {
        g.addColorStop(0, '#005580');
        g.addColorStop(0.6, '#00d4ff');
        g.addColorStop(1, '#e0ffff');
      }
      ctx.fillStyle = g;
      ctx.fill();

      ctx.strokeStyle = '#e0ffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.25);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.6, '#a5f3fc');
  coreGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = coreGrad;
  ctx.fill();
}

/* ── 5. TROPICAL HIBISCUS ──────────────────────────────────────────────── */
function drawHibiscus(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const petals = 5;
  for (let i = 0; i < petals; i++) {
    const angle = (i * 2 * Math.PI) / petals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.6, -r * 0.3, -r * 0.5, -r * 0.95, 0, -r);
    ctx.bezierCurveTo(r * 0.5, -r * 0.95, r * 0.6, -r * 0.3, 0, 0);

    const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, -r * 0.6, r);
    g.addColorStop(0, '#990033');
    g.addColorStop(0.3, '#ff3b5c');
    g.addColorStop(0.8, '#ff6b81');
    g.addColorStop(1, '#ff99ac');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.7);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -r * 0.85);
  ctx.strokeStyle = '#ffe600';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  for (let p = -2; p <= 2; p++) {
    ctx.beginPath();
    ctx.arc(p * 3, -r * 0.85 - Math.abs(p) * 2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff1493';
    ctx.fill();
  }
  ctx.restore();
}

/* ── 6. SOFT HYDRANGEA (PASTEL PERIWINKLE / BLUE-LAVENDER) ─────────────── */
function drawOrchid(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Cluster of 5 soft 4-petal hydrangeas
  const florets = [
    { x: 0, y: -r * 0.32, rScale: 0.42, color1: '#b8c0ff', color2: '#e7c6ff' },
    { x: -r * 0.35, y: 0, rScale: 0.4, color1: '#c8b6ff', color2: '#d8bbff' },
    { x: r * 0.35, y: 0, rScale: 0.4, color1: '#b8c0ff', color2: '#e7c6ff' },
    { x: -r * 0.2, y: r * 0.32, rScale: 0.38, color1: '#d8bbff', color2: '#f0e6ff' },
    { x: r * 0.2, y: r * 0.32, rScale: 0.38, color1: '#c8b6ff', color2: '#e7c6ff' },
  ];

  florets.forEach(f => {
    const fr = r * f.rScale;
    ctx.save();
    ctx.translate(cx + f.x, cy + f.y);

    for (let p = 0; p < 4; p++) {
      const angle = (p * Math.PI) / 2;
      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.arc(0, -fr * 0.45, fr * 0.5, 0, Math.PI * 2);

      const g = ctx.createLinearGradient(0, -fr, 0, 0);
      g.addColorStop(0, f.color2);
      g.addColorStop(1, f.color1);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.restore();
    }

    // Tiny white pip center
    ctx.beginPath();
    ctx.arc(0, 0, fr * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  });
}

/* ── 7. SOFT PEACH DAHLIA (PASTEL CORAL & CREAM PETALS) ───────────────── */
function drawDahlia(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const ringConfigs = [
    { count: 14, radius: r * 0.95, color1: '#e5989b', color2: '#ffb4a2' },
    { count: 12, radius: r * 0.76, color1: '#ffb4a2', color2: '#ffcdb2' },
    { count: 9, radius: r * 0.55, color1: '#ffcdb2', color2: '#ffe5d9' },
    { count: 6, radius: r * 0.36, color1: '#ffe5d9', color2: '#fff1e6' },
  ];

  ringConfigs.forEach((ring, rIdx) => {
    const rotOffset = (rIdx * Math.PI) / 8;
    for (let i = 0; i < ring.count; i++) {
      const angle = (i * 2 * Math.PI) / ring.count + rotOffset;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Soft rounded spoon/petal shape
      const rad = ring.radius;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-rad * 0.22, -rad * 0.4, -rad * 0.2, -rad * 0.92, 0, -rad);
      ctx.bezierCurveTo(rad * 0.2, -rad * 0.92, rad * 0.22, -rad * 0.4, 0, 0);

      const g = ctx.createLinearGradient(0, 0, 0, -rad);
      g.addColorStop(0, ring.color1);
      g.addColorStop(0.7, ring.color2);
      g.addColorStop(1, '#ffffff');
      ctx.fillStyle = g;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 180, 162, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  });

  // Soft warm gold center button
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb703';
  ctx.fill();
}

/* ── 8. BRIGHT DAISY ───────────────────────────────────────────────────── */
function drawDaisy(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const petals = 14;
  for (let i = 0; i < petals; i++) {
    const angle = (i * 2 * Math.PI) / petals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.2, -r * 0.4, -r * 0.18, -r * 0.92, 0, -r);
    ctx.bezierCurveTo(r * 0.18, -r * 0.92, r * 0.2, -r * 0.4, 0, 0);

    const g = ctx.createLinearGradient(0, 0, 0, -r);
    g.addColorStop(0, '#e2e8f0');
    g.addColorStop(0.4, '#ffffff');
    g.addColorStop(1, '#f8fafc');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.32);
  centerGrad.addColorStop(0, '#fef08a');
  centerGrad.addColorStop(0.5, '#eab308');
  centerGrad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = centerGrad;
  ctx.fill();
}

/* ── 9. CREAM CAMELLIA (PASTEL CREAM & SOFT BLUSH) ─────────────────────── */
function drawWaterLily(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Soft leaf backing
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
  ctx.fillStyle = '#a3b18a';
  ctx.fill();
  ctx.restore();

  // Multi-tier soft rounded camellia petal rings
  const rings = [
    { count: 12, rad: r * 0.85, col1: '#ffcad4', col2: '#fffdf0' },
    { count: 10, rad: r * 0.68, col1: '#ffe5ec', col2: '#fbf8cc' },
    { count: 8, rad: r * 0.50, col1: '#fde2e4', col2: '#ffffff' },
  ];

  rings.forEach((ring, idx) => {
    const rot = (idx * Math.PI) / 6;
    for (let i = 0; i < ring.count; i++) {
      const angle = (i * 2 * Math.PI) / ring.count + rot;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-ring.rad * 0.3, -ring.rad * 0.4, -ring.rad * 0.25, -ring.rad * 0.95, 0, -ring.rad);
      ctx.bezierCurveTo(ring.rad * 0.25, -ring.rad * 0.95, ring.rad * 0.3, -ring.rad * 0.4, 0, 0);

      const g = ctx.createLinearGradient(0, 0, 0, -ring.rad);
      g.addColorStop(0, ring.col1);
      g.addColorStop(0.6, ring.col2);
      g.addColorStop(1, '#ffffff');
      ctx.fillStyle = g;
      ctx.fill();

      ctx.restore();
    }
  });

  // Soft warm gold center
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = '#fef08a';
  ctx.fill();
}

/* ── 10. LAVENDER COSMOS ───────────────────────────────────────────────── */
function drawCosmos(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const petals = 8;
  for (let i = 0; i < petals; i++) {
    const angle = (i * 2 * Math.PI) / petals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-r * 0.35, -r * 0.4, -r * 0.38, -r * 0.85, -r * 0.2, -r);
    ctx.lineTo(0, -r * 0.92);
    ctx.lineTo(r * 0.2, -r);
    ctx.bezierCurveTo(r * 0.38, -r * 0.85, r * 0.35, -r * 0.4, 0, 0);

    const g = ctx.createLinearGradient(0, 0, 0, -r);
    g.addColorStop(0, '#701a75');
    g.addColorStop(0.5, '#c084fc');
    g.addColorStop(1, '#e9d5ff');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-r * 0.1, -r * 0.7);
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.1, -r * 0.7);
    ctx.strokeStyle = 'rgba(112, 26, 117, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
}

/**
 * Pre-renders 2 soft leaf variations on offscreen canvases for "All Mix" mode.
 */
export function generateLeafSprites(): HTMLCanvasElement[] {
  const leafSprites: HTMLCanvasElement[] = [];

  // Leaf 1: Twin Sage Green Leaves
  const c1 = document.createElement('canvas');
  c1.width = SPRITE_SIZE;
  c1.height = SPRITE_SIZE;
  const ctx1 = c1.getContext('2d', { alpha: true });
  if (ctx1) {
    ctx1.imageSmoothingEnabled = true;
    ctx1.imageSmoothingQuality = 'high';
    drawTwinLeaves(ctx1, SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE * 0.4);
  }
  leafSprites.push(c1);

  // Leaf 2: Single Soft Mint Leaf with Veins
  const c2 = document.createElement('canvas');
  c2.width = SPRITE_SIZE;
  c2.height = SPRITE_SIZE;
  const ctx2 = c2.getContext('2d', { alpha: true });
  if (ctx2) {
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = 'high';
    drawSingleLeaf(ctx2, SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE * 0.42);
  }
  leafSprites.push(c2);

  return leafSprites;
}

function drawTwinLeaves(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);

  [-0.45, 0.45].forEach((angle) => {
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.5, 0, -r * 0.95);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.5, 0, 0);

    const g = ctx.createLinearGradient(0, 0, 0, -r);
    g.addColorStop(0, '#588157');
    g.addColorStop(0.5, '#a3b18a');
    g.addColorStop(1, '#dad7cd');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r * 0.85);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  });

  ctx.restore();
}

function drawSingleLeaf(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-r * 0.55, -r * 0.5, 0, -r * 0.98);
  ctx.quadraticCurveTo(r * 0.55, -r * 0.5, 0, 0);

  const g = ctx.createLinearGradient(0, 0, 0, -r);
  g.addColorStop(0, '#3a5a40');
  g.addColorStop(0.6, '#74c69d');
  g.addColorStop(1, '#b7e4c7');
  ctx.fillStyle = g;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -r * 0.9);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

