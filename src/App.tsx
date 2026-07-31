import { useRef, useState } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import FlowerCanvas from './components/FlowerCanvas';
import { FLOWER_TYPES } from './utils/flowerSprites';
import './index.css';

function App() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [selectedFlowerIdx, setSelectedFlowerIdx] = useState<number>(-1); // -1 = Random Mix

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isLoaded,
    error,
    fingerPositionsRef,
    handLandmarksRef,
    isPalmOpenRef,
    containerSize,
  } = useHandTracking(videoRef, containerRef, cameraEnabled);

  return (
    <div className="container" ref={containerRef}>

      {/* ── Welcome screen ── */}
      {!cameraEnabled && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <div className="welcome-emoji">🌸</div>
            <h1 className="welcome-title">FLOWER WAND</h1>
            <p className="welcome-sub">Draw animated flowers in the air with your fingertip</p>
            <button
              id="start-camera-btn"
              className="start-btn"
              onClick={() => setCameraEnabled(true)}
            >
              <span className="start-btn-icon">📷</span>
              Turn on Camera
            </button>
            <p className="welcome-hint">☝️ Point to draw &nbsp;·&nbsp; 🖐️ Open palm to scatter</p>
          </div>
        </div>
      )}

      {/* ── Initializing overlay (after button click, before camera ready) ── */}
      {cameraEnabled && !isLoaded && (
        <div className="loading-overlay">
          <h1>FLOWER WAND</h1>
          {error ? (
            <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
          ) : (
            <p>Initializing camera and AI models...</p>
          )}
        </div>
      )}

      {/* ── Floating Flower Selection Toolbar ── */}
      {isLoaded && (
        <div
          className="flower-bar"
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          <button
            className={`flower-chip ${selectedFlowerIdx === -1 ? 'active' : ''}`}
            onClick={() => setSelectedFlowerIdx(-1)}
          >
            ✨ All Mix
          </button>
          {FLOWER_TYPES.map((flower, idx) => (
            <button
              key={flower.name}
              className={`flower-chip ${selectedFlowerIdx === idx ? 'active' : ''}`}
              onClick={() => setSelectedFlowerIdx(idx)}
            >
              <span className="flower-dot" style={{ backgroundColor: flower.palette }} />
              {flower.name}
            </button>
          ))}
        </div>
      )}

      <video
        ref={videoRef}
        className="webcam-video"
        playsInline
        autoPlay
        muted
      />

      <FlowerCanvas
        fingerPositionsRef={fingerPositionsRef}
        handLandmarksRef={handLandmarksRef}
        isPalmOpenRef={isPalmOpenRef}
        width={containerSize.width}
        height={containerSize.height}
        selectedFlowerIdx={selectedFlowerIdx}
      />

      {isLoaded && (
        <div className="instructions">
          ☝️ Point to draw &nbsp;·&nbsp; 🖐️ Open palm to scatter
        </div>
      )}
    </div>
  );
}

export default App;

