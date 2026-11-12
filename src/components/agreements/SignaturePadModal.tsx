import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Check, PenLine } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  title: string;
  signatoryName: string;
  role: 'owner' | 'tenant';
  onSave: (signatureDataUri: string) => void;
  onClose: () => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  title,
  signatoryName,
  role,
  onSave,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // default navy blue for legal ink
  const penWidth = 2.5;
  const [agreedToLegal, setAgreedToLegal] = useState(true);
  const [currentDateStr] = useState(() => new Date().toLocaleDateString('en-IN'));

  // Set up canvas sizing and high DPI scaling
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  useEffect(() => {
    if (isOpen) {
      // Delay slightly for modal layout to calculate dimensions
      const timer = setTimeout(setupCanvas, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setupCanvas]);

  if (!isOpen) return null;

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Export transparent PNG Data URL
    const dataUri = canvas.toDataURL('image/png');
    onSave(dataUri);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              role === 'owner' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <PenLine size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500">
                Signatory: <b>{signatoryName}</b> ({role === 'owner' ? 'First Party / Landlord' : 'Second Party / Tenant'})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Instructions */}
        <div className="my-3 flex items-center justify-between text-xs text-slate-500">
          <span>Draw your signature using finger, stylus, or mouse inside the box:</span>
          
          {/* Pen Color Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Ink:</span>
            {[
              { color: '#1e3a8a', label: 'Blue' },
              { color: '#111827', label: 'Black' },
              { color: '#047857', label: 'Green' }
            ].map(c => (
              <button
                key={c.color}
                type="button"
                onClick={() => setPenColor(c.color)}
                className={`w-5 h-5 rounded-full border-2 transition ${
                  penColor === c.color ? 'border-emerald-600 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.color }}
                title={`${c.label} Ink`}
              />
            ))}
          </div>
        </div>

        {/* Canvas Drawing Area */}
        <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/60 overflow-hidden touch-none select-none">
          <canvas
            ref={canvasRef}
            className="w-full h-44 cursor-crosshair block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-semibold">
              Sign here / यहाँ हस्ताक्षर करें
            </div>
          )}

          {/* Baseline guide line */}
          <div className="absolute bottom-6 left-8 right-8 border-b border-slate-300/80 pointer-events-none flex justify-between text-[9px] text-slate-400 font-mono">
            <span>✕ SIGNATURE BASELINE</span>
            <span>DATE: {currentDateStr}</span>
          </div>
        </div>

        {/* Actions bar under canvas */}
        <div className="flex items-center justify-between mt-2.5">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
          >
            <RotateCcw size={13} />
            <span>Clear / साफ करें</span>
          </button>

          <div className="text-[10px] text-slate-400">
            {hasDrawn ? 'Signature captured' : 'Awaiting signature'}
          </div>
        </div>

        {/* Legal Consent Checkbox */}
        <label className="flex items-start gap-2 mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToLegal}
            onChange={e => setAgreedToLegal(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-[11px] leading-snug">
            I confirm that this digital signature is legally binding and authentic pursuant to the Information Technology Act (IT Act).
          </span>
        </label>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasDrawn || !agreedToLegal}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              hasDrawn && agreedToLegal
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check size={14} />
            <span>Apply Signature & Save</span>
          </button>
        </div>

      </div>
    </div>
  );
};
