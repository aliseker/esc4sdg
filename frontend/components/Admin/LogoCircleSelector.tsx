'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PRESET_TO_PERCENT: Record<string, string> = {
  center: '50% 50%',
  top: '50% 0%',
  bottom: '50% 100%',
  left: '0% 50%',
  right: '100% 50%',
};

function parsePosition(value: string | undefined): { x: number; y: number } {
  if (!value?.trim()) return { x: 50, y: 50 };
  const normalized = PRESET_TO_PERCENT[value.trim()] ?? value.trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)\s*%/);
  if (match) return { x: Number(match[1]), y: Number(match[2]) };
  return { x: 50, y: 50 };
}

function toPositionString(x: number, y: number): string {
  return `${Math.round(Math.max(0, Math.min(100, x)))}% ${Math.round(Math.max(0, Math.min(100, y)))}%`;
}

const CIRCLE_SIZE = 88;

type Props = {
  imageSrc: string;
  value: string;
  onChange: (position: string) => void;
};

export function LogoCircleSelector({ imageSrc, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const parsed = parsePosition(value);
  const [center, setCenter] = useState({ x: parsed.x, y: parsed.y });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, centerX: 0, centerY: 0 });

  useEffect(() => {
    setCenter(parsePosition(value));
  }, [value]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (w && h) setImageSize({ w, h });
  }, []);

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
      const radius = CIRCLE_SIZE / 2;
      const centerX = (center.x / 100) * rect.width;
      const centerY = (center.y / 100) * rect.height;
      const dist = Math.hypot(e.clientX - rect.left - centerX, e.clientY - rect.top - centerY);
      if (dist <= radius + 10) {
        setDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, centerX: center.x, centerY: center.y };
        containerRef.current?.setPointerCapture(e.pointerId);
      }
    },
    [center, getContainerRect]
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
      onChange(toPositionString(newX, newY));
    },
    [dragging, getContainerRect, onChange]
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

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-stone-500">Daireyi sürükleyerek logoda görünecek alanı seçin</p>
      <div
        ref={containerRef}
        className="relative w-full max-w-[280px] aspect-square overflow-hidden rounded-xl border-2 border-stone-200 bg-stone-100 select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Logo"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          onLoad={handleImageLoad}
        />
        {/* Draggable circle – sürükleyerek konum seçilir */}
        <div
          role="slider"
          aria-label="Logo alanı konumu"
          className="absolute border-2 border-white shadow-lg ring-2 ring-teal-500/60 rounded-full cursor-grab active:cursor-grabbing touch-none"
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            left: `calc(${center.x}% - ${CIRCLE_SIZE / 2}px)`,
            top: `calc(${center.y}% - ${CIRCLE_SIZE / 2}px)`,
          }}
        />
      </div>
      <p className="text-xs text-stone-400">Konum: {value || '50% 50%'}</p>
    </div>
  );
}
