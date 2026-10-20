import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  imageLabel?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  imageLabel = 'Property Photo'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access failed, fallback available:', err);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in browser settings, or use the file picker.'
          : 'Unable to start camera stream. You can upload or snap using device camera directly.'
      );
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedBlobUrl(null);
      setCapturedFile(null);
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Handle Capture snapshot from video stream
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedFile(file);
      const url = URL.createObjectURL(blob);
      setCapturedBlobUrl(url);
    }, 'image/jpeg', 0.9);
  };

  // Confirm and upload captured photo
  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      handleClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
    }
    setCapturedBlobUrl(null);
    setCapturedFile(null);
    startCamera(facingMode);
  };

  // Switch camera front/back
  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Native mobile camera fallback
  const handleNativeFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
    }
    setCapturedBlobUrl(null);
    setCapturedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Live Camera Snapshot</h4>
              <p className="text-[11px] text-slate-400">{imageLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {capturedBlobUrl ? (
            <img
              src={capturedBlobUrl}
              alt="Captured Snapshot"
              className="w-full h-full object-cover"
            />
          ) : cameraError ? (
            <div className="p-6 text-center max-w-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload size={14} /> Open Device Camera / File
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> Starting camera...
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden canvas for snapshot rendering */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Native camera file picker fallback */}
          <input
            ref={fileFallbackRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleNativeFallback}
            className="hidden"
          />
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          {capturedBlobUrl ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={15} /> Use This Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                disabled={Boolean(cameraError)}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                title="Switch front/rear camera"
              >
                <RefreshCw size={14} /> Flip Camera
              </button>

              <button
                type="button"
                onClick={handleSnap}
                disabled={Boolean(cameraError || isInitializing)}
                className="px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-xl hover:scale-102 active:scale-98 transition disabled:opacity-40 cursor-pointer"
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-rose-500" />
                Capture Photo
              </button>

              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="p-2 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
                title="Upload file instead"
              >
                Upload file
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
