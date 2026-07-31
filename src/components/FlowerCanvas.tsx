import React, { useRef, useEffect } from 'react';
import type { FingerPos, ScreenPoint } from '../hooks/useHandTracking';
import { generateFlowerSprites, FLOWER_TYPES } from '../utils/flowerSprites';

interface Props {
  fingerPositionsRef: React.RefObject<FingerPos[]>;
  handLandmarksRef: React.RefObject<ScreenPoint[][]>;
  isPalmOpenRef: React.RefObject<boolean>;
  width: number;
  height: number;
  selectedFlowerIdx?: number; // optional filter (-1 or undefined for random mix)
}

interface Flower {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spriteIdx: number; // 0..9 into FLOWER_SPRITES
  baseSize: number;
  isScattered: boolean;
  rotation: number;
  vRot: number;
  pulsePhase: number;
  pulseSpeed: number;
  wobbleAmp: number;
  animStyle: number; // 0: Spin, 1: Pulse, 2: Wobble, 3: Spiral
  alpha: number;
}

// MediaPipe hand skeleton connections
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const FINGERTIPS = new Set([4, 8, 12, 16, 20]);

// ── Pre-render 10 vector flower graphics once into offscreen canvases ──────
// drawImage with pre-rendered bitmaps is CPU SIMD-accelerated and ultra fast.
const FLOWER_SPRITES: HTMLCanvasElement[] = generateFlowerSprites();

const GRAVITY = 0.45;
const FRICTION = 0.94;
const MAX_FLOWERS = 350;
const MIN_SPAWN_DIST = 16;

export default function FlowerCanvas({
  fingerPositionsRef,
  handLandmarksRef,
  isPalmOpenRef,
  width,
  height,
  selectedFlowerIdx = -1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<Flower[]>([]);
  const prevPositionsRef = useRef<FingerPos[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;

    let rafId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const fingerPositions = fingerPositionsRef.current ?? [];
      const hands = handLandmarksRef.current ?? [];
      const palmOpen = isPalmOpenRef.current ?? false;

      // ── Spawn flowers at fingertips ────────────────────────────────────────
      if (fingerPositions.length === 0 || palmOpen) {
        prevPositionsRef.current = [];
      } else {
        fingerPositions.forEach((pos, idx) => {
          const prev = prevPositionsRef.current[idx];
          const spawnAt = (x: number, y: number) => {
            if (flowersRef.current.length >= MAX_FLOWERS) {
              flowersRef.current.shift();
            }

            const chosenSprite = selectedFlowerIdx >= 0 && selectedFlowerIdx < FLOWER_SPRITES.length
              ? selectedFlowerIdx
              : Math.floor(Math.random() * FLOWER_TYPES.length);

            // Randomize rotation speed (-0.05 to +0.05 rad/frame)
            const rotDir = Math.random() < 0.5 ? -1 : 1;
            const rotSpeed = rotDir * (0.015 + Math.random() * 0.035);

            flowersRef.current.push({
              x,
              y,
              vx: 0,
              vy: 0,
              spriteIdx: chosenSprite,
              baseSize: 38 + Math.random() * 24,
              isScattered: false,
              rotation: Math.random() * Math.PI * 2,
              vRot: rotSpeed,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.03 + Math.random() * 0.05,
              wobbleAmp: 0.15 + Math.random() * 0.2,
              animStyle: Math.floor(Math.random() * 4),
              alpha: 1,
            });
          };

          if (prev) {
            if (Math.hypot(pos.x - prev.x, pos.y - prev.y) < MIN_SPAWN_DIST) return;
            spawnAt(pos.x, pos.y);
          } else {
            spawnAt(pos.x, pos.y);
          }
          prevPositionsRef.current[idx] = { ...pos };
        });
      }

      // ── Scatter on open palm gesture ───────────────────────────────────────
      if (palmOpen) {
        for (const f of flowersRef.current) {
          if (f.isScattered) continue;
          f.isScattered = true;
          const angle = Math.random() * Math.PI * 2;
          const force = 10 + Math.random() * 18;
          f.vx = Math.cos(angle) * force;
          f.vy = Math.sin(angle) * force - 12;
          f.vRot = (Math.random() - 0.5) * 0.35;
        }
      }

      // ── Draw hand skeleton ────────────────────────────────────────────────
      for (const hand of hands) {
        if (hand.length < 21) continue;

        // Skeleton bones
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = palmOpen
          ? 'rgba(255, 140, 200, 0.85)'
          : 'rgba(140, 200, 255, 0.7)';
        for (const [a, b] of HAND_CONNECTIONS) {
          ctx.moveTo(hand[a].x, hand[a].y);
          ctx.lineTo(hand[b].x, hand[b].y);
        }
        ctx.stroke();

        // Regular joints
        ctx.beginPath();
        ctx.fillStyle = 'rgba(210, 230, 255, 0.9)';
        for (let i = 0; i < 21; i++) {
          if (FINGERTIPS.has(i) || i === 0) continue;
          const pt = hand[i];
          ctx.moveTo(pt.x + 4, pt.y);
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        }
        ctx.fill();

        // Wrist joint
        ctx.beginPath();
        ctx.fillStyle = 'rgba(210, 230, 255, 0.9)';
        ctx.arc(hand[0].x, hand[0].y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Fingertip points
        ctx.beginPath();
        ctx.fillStyle = palmOpen ? '#ff3d9a' : '#ff85c2';
        for (const i of FINGERTIPS) {
          const pt = hand[i];
          ctx.moveTo(pt.x + 7, pt.y);
          ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // ── Draw & animate flower particles ───────────────────────────────────
      let currentAlpha = 1;
      ctx.globalAlpha = 1;

      const alive: Flower[] = [];
      for (const f of flowersRef.current) {
        // Animation physics updates
        f.rotation += f.vRot;
        f.pulsePhase += f.pulseSpeed;

        if (f.isScattered) {
          f.vy += GRAVITY;
          f.vx *= FRICTION;
          f.vy *= FRICTION;
          f.x += f.vx;
          f.y += f.vy;
          f.alpha -= 0.022;
        }

        const displayAlpha = f.isScattered
          ? Math.pow(Math.max(0, f.alpha), 1.5)
          : 1;

        if (displayAlpha !== currentAlpha) {
          ctx.globalAlpha = displayAlpha;
          currentAlpha = displayAlpha;
        }

        // Dynamic size calculation (Breathing pulse effect)
        let currentSize = f.baseSize;
        if (f.animStyle === 1 || f.animStyle === 3) {
          currentSize *= 1 + 0.18 * Math.sin(f.pulsePhase);
        }

        // Dynamic rotation angle (including wind wobble tilt if animStyle === 2)
        let renderRotation = f.rotation;
        if (f.animStyle === 2) {
          renderRotation += Math.sin(f.pulsePhase) * f.wobbleAmp;
        }

        const sprite = FLOWER_SPRITES[f.spriteIdx] || FLOWER_SPRITES[0];
        const half = currentSize / 2;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(renderRotation);
        ctx.drawImage(sprite, -half, -half, currentSize, currentSize);
        ctx.restore();

        if (!f.isScattered || (f.alpha > 0 && f.y < height + 150 && f.x > -150 && f.x < width + 150)) {
          alive.push(f);
        }
      }

      ctx.globalAlpha = 1;
      flowersRef.current = alive;

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [width, height, fingerPositionsRef, handLandmarksRef, isPalmOpenRef, selectedFlowerIdx]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-overlay"
      width={width}
      height={height}
    />
  );
}


