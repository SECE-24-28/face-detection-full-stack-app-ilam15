'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Eye, Shield, Compass, Sparkles } from 'lucide-react';

interface FaceViewerProps {
  imageUrl: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  landmarks: Record<string, { x: number; y: number }>;
}

export default function FaceViewer({ imageUrl, faceRectangle, landmarks }: FaceViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Toggles
  const [showBox, setShowBox] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showContour, setShowContour] = useState(true);
  const [glowMode, setGlowMode] = useState(true);

  // Triggered when image finishes loading
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setDisplaySize({ width: img.clientWidth, height: img.clientHeight });
    setImageLoaded(true);
  };

  // Keep display dimensions updated when layout changes or window resizes
  useEffect(() => {
    const updateSize = () => {
      if (imageRef.current && imageLoaded) {
        setDisplaySize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateSize);
    
    // Set up a resize observer on the container
    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(() => updateSize());
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (observer) observer.disconnect();
    };
  }, [imageLoaded]);

  // Handle canvas rendering
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || naturalSize.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match display dimensions
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = displaySize.width / naturalSize.width;
    const scaleY = displaySize.height / naturalSize.height;

    // 1. Draw Bounding Box
    if (showBox && faceRectangle) {
      const rx = faceRectangle.left * scaleX;
      const ry = faceRectangle.top * scaleY;
      const rw = faceRectangle.width * scaleX;
      const rh = faceRectangle.height * scaleY;

      // Draw box shadow/glow first
      if (glowMode) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#8b5cf6'; // Violet glow
      }
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, rw, rh);

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw corner brackets
      const len = Math.min(rw, rh) * 0.15;
      ctx.strokeStyle = '#d946ef'; // Magenta accents
      ctx.lineWidth = 4;
      
      // Top Left Corner
      ctx.beginPath();
      ctx.moveTo(rx, ry + len);
      ctx.lineTo(rx, ry);
      ctx.lineTo(rx + len, ry);
      ctx.stroke();

      // Top Right Corner
      ctx.beginPath();
      ctx.moveTo(rx + rw - len, ry);
      ctx.lineTo(rx + rw, ry);
      ctx.lineTo(rx + rw, ry + len);
      ctx.stroke();

      // Bottom Left Corner
      ctx.beginPath();
      ctx.moveTo(rx, ry + rh - len);
      ctx.lineTo(rx, ry + rh);
      ctx.lineTo(rx + len, ry + rh);
      ctx.stroke();

      // Bottom Right Corner
      ctx.beginPath();
      ctx.moveTo(rx + rw - len, ry + rh);
      ctx.lineTo(rx + rw, ry + rh);
      ctx.lineTo(rx + rw, ry + rh - len);
      ctx.stroke();

      // Label box
      ctx.fillStyle = '#8b5cf6';
      ctx.font = '10px Geist, monospace';
      ctx.fillText('FACE DETECTED', rx + 6, ry - 6);
    }

    // Help function to scale a point
    const getPoint = (name: string) => {
      const pt = landmarks[name];
      if (!pt) return null;
      return { x: pt.x * scaleX, y: pt.y * scaleY };
    };

    // Helper to draw a connected line loop
    const drawLineLoop = (points: string[], color: string, width: number, isClosed = false) => {
      ctx.beginPath();
      let first = true;
      points.forEach((name) => {
        const pt = getPoint(name);
        if (pt) {
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      });
      if (isClosed) ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    // Helper to draw landmarks dots
    const drawDots = (points: string[], color: string, size = 3) => {
      points.forEach((name) => {
        const pt = getPoint(name);
        if (pt) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          if (glowMode) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = color;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    };

    // 2. Draw Contour
    if (showContour) {
      const leftContour = Array.from({ length: 16 }, (_, i) => `contour_left${i + 1}`);
      const rightContour = Array.from({ length: 16 }, (_, i) => `contour_right${i + 1}`).reverse();
      const contourPoints = [...leftContour, 'contour_chin', ...rightContour];
      
      drawLineLoop(contourPoints, 'rgba(6,182,212,0.4)', 2, false); // Cyan contour line
      drawDots(contourPoints, '#06b6d4', 2.5); // Cyan contour dots
    }

    // 3. Draw Eyes & Eyebrows
    if (showLandmarks) {
      // Left Eyebrow
      const leftEyebrow = Array.from({ length: 8 }, (_, i) => `left_eyebrow_${i + 1}`);
      drawLineLoop(leftEyebrow, 'rgba(139,92,246,0.5)', 2);
      drawDots(leftEyebrow, '#a78bfa', 2);

      // Right Eyebrow
      const rightEyebrow = Array.from({ length: 8 }, (_, i) => `right_eyebrow_${i + 1}`);
      drawLineLoop(rightEyebrow, 'rgba(139,92,246,0.5)', 2);
      drawDots(rightEyebrow, '#a78bfa', 2);

      // Eyes
      const leftEye = ['left_eye_left_corner', 'left_eye_top_1', 'left_eye_top_2', 'left_eye_right_corner', 'left_eye_bottom_2', 'left_eye_bottom_1'];
      drawLineLoop(leftEye, 'rgba(236,72,153,0.6)', 1.5, true);
      drawDots(leftEye, '#ec4899', 2);
      drawDots(['left_eye_pupil'], '#f472b6', 2.5);

      const rightEye = ['right_eye_left_corner', 'right_eye_top_1', 'right_eye_top_2', 'right_eye_right_corner', 'right_eye_bottom_2', 'right_eye_bottom_1'];
      drawLineLoop(rightEye, 'rgba(236,72,153,0.6)', 1.5, true);
      drawDots(rightEye, '#ec4899', 2);
      drawDots(['right_eye_pupil'], '#f472b6', 2.5);

      // Nose
      const noseBridge = ['nose_bridge1', 'nose_bridge2', 'nose_bridge3', 'nose_bridge4', 'nose_tip'];
      drawLineLoop(noseBridge, 'rgba(234,179,8,0.5)', 2);
      drawDots(noseBridge, '#eab308', 2);

      const noseWings = ['nose_left_wing1', 'nose_left_wing2', 'nose_tip', 'nose_right_wing2', 'nose_right_wing1'];
      drawLineLoop(noseWings, 'rgba(234,179,8,0.4)', 1.5);
      drawDots(['nose_left_wing1', 'nose_left_wing2', 'nose_right_wing1', 'nose_right_wing2'], '#eab308', 2);

      // Mouth
      const mouthOuter = [
        'mouth_left_corner',
        'mouth_upper_lip_top1',
        'mouth_upper_lip_top2',
        'mouth_upper_lip_top3',
        'mouth_right_corner',
        'mouth_lower_lip_bottom3',
        'mouth_lower_lip_bottom2',
        'mouth_lower_lip_bottom1',
      ];
      drawLineLoop(mouthOuter, 'rgba(239,68,68,0.6)', 2, true);

      const mouthInner = [
        'mouth_left_corner',
        'mouth_upper_lip_bottom1',
        'mouth_upper_lip_bottom2',
        'mouth_upper_lip_bottom3',
        'mouth_right_corner',
        'mouth_lower_lip_top3',
        'mouth_lower_lip_top2',
        'mouth_lower_lip_top1',
      ];
      drawLineLoop(mouthInner, 'rgba(239,68,68,0.4)', 1.5, true);
      drawDots([...mouthOuter, ...mouthInner], '#ef4444', 2);
    }
  }, [imageLoaded, displaySize, naturalSize, landmarks, faceRectangle, showBox, showLandmarks, showContour, glowMode]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Viewer Box */}
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full rounded-2xl border border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden shadow-2xl group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Analyzed face"
          className="w-full h-full object-contain select-none pointer-events-none"
          onLoad={handleImageLoad}
        />
        
        {/* Overlaid Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-850 border-t-violet-500 animate-spin"></div>
          </div>
        )}
      </div>

      {/* Layer Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setShowBox(!showBox)}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
            showBox
              ? 'bg-violet-950/40 border-violet-800 text-violet-300'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-350'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Face Box
        </button>

        <button
          onClick={() => setShowContour(!showContour)}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
            showContour
              ? 'bg-cyan-950/40 border-cyan-800 text-cyan-350'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-350'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Contours
        </button>

        <button
          onClick={() => setShowLandmarks(!showLandmarks)}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
            showLandmarks
              ? 'bg-pink-950/40 border-pink-800 text-pink-300'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-350'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Features
        </button>

        <button
          onClick={() => setGlowMode(!glowMode)}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
            glowMode
              ? 'bg-fuchsia-950/40 border-fuchsia-800 text-fuchsia-350'
              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-350'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Neon Glow
        </button>
      </div>
    </div>
  );
}
