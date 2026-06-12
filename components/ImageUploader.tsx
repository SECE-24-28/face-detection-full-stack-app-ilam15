'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, RefreshCw, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess: (scan: any) => void;
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Webcam States
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  // Process and validate file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image size exceeds 8MB. Please upload a smaller image.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    uploadFile(file);
  };

  // Upload file to Backend
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch('/api/face/detect', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Face analysis failed');
      }

      // Small delay to make interaction smooth
      setTimeout(() => {
        onUploadSuccess(result.scan);
        setIsUploading(false);
      }, 500);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload. Please try again.');
      setIsUploading(false);
      setImagePreview(null);
    }
  };

  // Webcam Logic
  const startCamera = async () => {
    setError(null);
    setShowCamera(true);
    setImagePreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Could not access camera. Please check your browser permissions.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw the current frame of the video onto the canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas image to blob and upload
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });
            setImagePreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
            uploadFile(capturedFile);
          } else {
            setError('Failed to capture snapshot.');
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Upload error display */}
      {error && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-950/40 border border-red-800 text-red-200 rounded-2xl animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload / Camera Panel */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 overflow-hidden bg-zinc-950/60 backdrop-blur-md ${
          dragActive
            ? 'border-violet-500 bg-violet-950/20 scale-[1.01]'
            : imagePreview
            ? 'border-zinc-800'
            : 'border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {/* Live Video Camera stream */}
        {showCamera && (
          <div className="absolute inset-0 flex flex-col justify-between bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Camera Frame Overlays */}
            <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)] pointer-events-none relative">
                <div className="absolute inset-0 border border-dashed border-violet-500/20 animate-spin-slow rounded-full"></div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 z-10 px-4">
              <button
                onClick={stopCamera}
                className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={capturePhoto}
                className="w-16 h-16 flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95"
              >
                <div className="w-7 h-7 rounded-full border-2 border-white"></div>
              </button>
            </div>
          </div>
        )}

        {/* Uploading progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-24 h-24 mb-6">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-ping"></div>
              {/* Spinning loading indicator */}
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-violet-500 animate-spin"></div>
              {/* Inside Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-violet-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing Face</h3>
            <p className="text-sm text-zinc-400 max-w-xs mb-4">
              Extracting biometric keypoints and evaluating visual attributes...
            </p>
            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-zinc-850 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Display Image Preview */}
        {imagePreview && !isUploading && (
          <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Normal Drag & Drop UI (When empty) */}
        {!imagePreview && !showCamera && !isUploading && (
          <div className="flex flex-col items-center text-center p-8 pointer-events-none select-none">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner text-zinc-400">
              <Upload className="w-7 h-7 text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Upload portrait image
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-8">
              Drag & drop your file here, or click to browse. Max size 8MB.
            </p>
            
            <div className="flex items-center gap-4 pointer-events-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium text-sm rounded-xl hover:bg-zinc-850 transition-all active:scale-95"
              >
                Browse File
              </button>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-500 transition-all active:scale-95 flex items-center gap-2 shadow-[0_4px_15px_rgba(139,92,246,0.3)]"
              >
                <Camera className="w-4.5 h-4.5" />
                Use Camera
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
