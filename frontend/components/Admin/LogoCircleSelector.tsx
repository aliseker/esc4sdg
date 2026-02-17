'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PRESET_TO_VAL: Record<string, string> = {
  center: '50% 50% 88',
  top: '50% 0% 88',
  bottom: '50% 100% 88',
  left: '0% 50% 88',
  right: '100% 50% 88',
};

function parseValue(value: string | undefined): { x: number; y: number; size: number } {
  if (!value?.trim()) return { x: 50, y: 50, size: 88 };
  const normalized = PRESET_TO_VAL[value.trim()] ?? value.trim();
  // Match: "50% 50% 88" or "50% 50%"
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)\s*%(?:\s*(\d+(?:\.\d+)?))?/);
  if (match) {
    return {
      x: Number(match[1]),
      y: Number(match[2]),
      size: match[3] ? Number(match[3]) : 88,
    };
  }
  return { x: 50, y: 50, size: 88 };
}

function toValueString(x: number, y: number, size: number): string {
  return `${Math.round(Math.max(0, Math.min(100, x)))}% ${Math.round(Math.max(0, Math.min(100, y)))}% ${Math.round(size)}`;
}

type Props = {
  imageSrc: string;
  value: string;
  onChange: (value: string) => void;
};

export function LogoCircleSelector({ imageSrc, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parsed = parseValue(value);
  const [center, setCenter] = useState({ x: parsed.x, y: parsed.y });
  const [size, setSize] = useState(parsed.size);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, centerX: 0, centerY: 0 });

  useEffect(() => {
    const p = parseValue(value);
    setCenter({ x: p.x, y: p.y });
    setSize(p.size);
  }, [value]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const getContainerRect = useCallback(() => {
    if (!containerRef.current) return null;
    return containerRef.current.getBoundingClientRect();
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const rect = getContainerRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const newX = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const newY = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);

      setCenter({ x: newX, y: newY });
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, centerX: newX, centerY: newY };

      onChange(toValueString(newX, newY, size));
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [clamp, getContainerRect, onChange, size]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const rect = getContainerRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;

      const newX = clamp(dragStart.current.centerX + dx, 0, 100);
      const newY = clamp(dragStart.current.centerY + dy, 0, 100);

      setCenter({ x: newX, y: newY });
      onChange(toValueString(newX, newY, size));
    },
    [clamp, dragging, getContainerRect, onChange, size]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) {
        setDragging(false);
        containerRef.current?.releasePointerCapture(e.pointerId);
      }
    },
    [dragging]
  );

  if (!imageSrc) return null;

  // The base width of our selection container (match the CSS w-[320px])
  const BASE_WIDTH = 320;
  // The preview circle diameter
  const PREVIEW_SIZE = 208;

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-5 rounded-3xl bg-white border border-stone-200 shadow-xl shadow-stone-200/50">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-bold text-stone-800 flex items-center justify-between px-1">
          Logo Seçimi
          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Sürükleyerek ayarla</span>
        </label>
        <div
          ref={containerRef}
          className="relative w-full sm:w-[320px] aspect-square overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-50 shadow-inner cursor-crosshair select-none"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background image - centered and borderless */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={imageSrc}
              alt="Logo Source"
              className="max-w-full max-h-full object-contain opacity-30 grayscale"
              draggable={false}
            />
          </div>

          {/* Highlighted area (the crop circle) */}
          <div
            className="absolute border-2 border-teal-500 shadow-[0_0_0_9999px_rgba(255,255,255,0.7)] rounded-full pointer-events-none z-10"
            style={{
              width: size,
              height: size,
              left: `calc(${center.x}% - ${size / 2}px)`,
              top: `calc(${center.y}% - ${size / 2}px)`,
            }}
          >
            {/* Crosshair for precision */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-px h-[1px] bg-teal-500/20" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-px w-[1px] bg-teal-500/20" />
          </div>
        </div>

        <div className="space-y-3 px-1">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-400">
            <span>Daire Çapı (Zoom)</span>
            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-mono text-xs border border-stone-200">{Math.round(size)}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="400"
            step="1"
            value={size}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setSize(newSize);
              onChange(toValueString(center.x, center.y, newSize));
            }}
            className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-teal-600 border border-stone-200"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 py-4 sm:border-l sm:border-stone-100 sm:pl-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] bg-stone-50 px-3 py-1 rounded-full border border-stone-100">Önizleme</span>
        </div>

        <div className="relative w-52 h-52 rounded-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] overflow-hidden bg-white ring-[1px] ring-black/5">
          {/* Synchronized Precision Preview Logic */}
          <div className="relative w-full h-full">
            <img
              src={imageSrc}
              alt="Cropped Preview"
              className="absolute transition-all duration-300 object-contain"
              style={{
                width: `${(BASE_WIDTH / size) * 100}%`,
                height: `${(BASE_WIDTH / size) * 100}%`,
                left: `${50 - ((BASE_WIDTH / size) * (center.x - 50))}%`,
                top: `${50 - ((BASE_WIDTH / size) * (center.y - 50))}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'none'
              }}
            />
          </div>
        </div>

        <p className="text-[11px] font-medium text-stone-400 text-center max-w-[140px] leading-relaxed italic">
          Sitede dairesel olarak bu şekilde görünecek
        </p>
      </div>
    </div>
  );
}
