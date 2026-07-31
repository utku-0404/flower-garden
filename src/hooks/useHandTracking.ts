import { useEffect, useState, useRef } from 'react';
import type { RefObject } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface FingerPos { x: number; y: number; z: number; }
export interface ScreenPoint { x: number; y: number; }

export interface TrackingRefs {
  fingerPositions: React.RefObject<FingerPos[]>;
  handLandmarks: React.RefObject<ScreenPoint[][]>;
  isPalmOpen: React.RefObject<boolean>;
}

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  // ── Low-frequency state (triggers re-renders, but only rarely) ──
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // ── High-frequency refs (updated 60x/sec, ZERO re-renders) ──────
  const fingerPositionsRef = useRef<FingerPos[]>([]);
  const handLandmarksRef   = useRef<ScreenPoint[][]>([]);
  const isPalmOpenRef      = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;
    let lastVideoTime = -1;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width:  containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();

    // ── Gesture helpers ──────────────────────────────────────────────

    const isExtended = (
      tip: NormalizedLandmark,
      mcp: NormalizedLandmark,
      wrist: NormalizedLandmark
    ) => {
      const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const mcpDist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
      return tipDist > mcpDist * 1.2;
    };

    /** ☝️ Only index up, others curled → draw flowers */
    const isPointing = (lm: NormalizedLandmark[]) => {
      const w = lm[0];
      return (
         isExtended(lm[8],  lm[5],  w) &&  // index up
        !isExtended(lm[12], lm[9],  w) &&  // middle curled
        !isExtended(lm[16], lm[13], w) &&  // ring curled
        !isExtended(lm[20], lm[17], w)     // pinky curled
      );
    };

    /** 🖐️ All 5 fingers extended → scatter */
    const isPalmOpenGesture = (lm: NormalizedLandmark[]) => {
      const w = lm[0];
      const count = [
        isExtended(lm[4],  lm[2],  w),
        isExtended(lm[8],  lm[5],  w),
        isExtended(lm[12], lm[9],  w),
        isExtended(lm[16], lm[13], w),
        isExtended(lm[20], lm[17], w),
      ].filter(Boolean).length;
      return count === 5;
    };

    // ── MediaPipe init ───────────────────────────────────────────────

    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
              videoRef.current?.play().catch(console.error);
              setIsLoaded(true); // only setState call in the hot path
              predictWebcam();
            };
          }
        } else {
          setError('Camera not found or permissions denied.');
        }
      } catch (err: any) {
        console.error('Init error:', err);
        setError(err.message || String(err));
      }
    };

    // ── Per-frame detection (writes to refs only — no setState) ─────

    const predictWebcam = () => {
      const video = videoRef.current;
      if (!video || !handLandmarker) return;

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const results = handLandmarker.detectForVideo(video, performance.now());

        if (results.landmarks?.length > 0) {
          const newFingerPositions: FingerPos[]    = [];
          const newHandLandmarks:   ScreenPoint[][] = [];
          let anyPalmOpen = false;

          for (const lm of results.landmarks) {
            if (containerRef.current) {
              const { clientWidth, clientHeight } = containerRef.current;

              const screenPts: ScreenPoint[] = lm.map(p => ({
                x: (1 - p.x) * clientWidth,
                y: p.y * clientHeight,
              }));
              newHandLandmarks.push(screenPts);

              if (isPointing(lm)) {
                newFingerPositions.push({
                  x: screenPts[8].x,
                  y: screenPts[8].y,
                  z: lm[8].z,
                });
              }
            }
            if (isPalmOpenGesture(lm)) anyPalmOpen = true;
          }

          // Direct ref writes — zero React overhead
          fingerPositionsRef.current = newFingerPositions;
          handLandmarksRef.current   = newHandLandmarks;
          isPalmOpenRef.current      = anyPalmOpen;
        } else {
          fingerPositionsRef.current = [];
          handLandmarksRef.current   = [];
          isPalmOpenRef.current      = false;
        }
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    initializeMediaPipe();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
      window.removeEventListener('resize', updateSize);
    };
  }, [enabled]);

  return {
    isLoaded,
    error,
    containerSize,
    // Expose refs directly — canvas reads them in its own RAF loop
    fingerPositionsRef,
    handLandmarksRef,
    isPalmOpenRef,
  };
}
