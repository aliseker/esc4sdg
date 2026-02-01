'use client';

/**
 * Pac-Man L-shaped route: right → down → right
 * Dots placed along the path, Pac-Man eats them, ghost follows behind.
 */

const DURATION = 16; // seconds for full path

// CSS keyframe timing (must match globals.css)
// Segment 1: 0-29% (left: -4% → 45%, top: 33%)
// Segment 2: 30-62% (left: 45%, top: 33% → 78%)
// Segment 3: 63-100% (left: 45% → 102%, top: 78%)

// Dots along the L path — exact alignment: seg1 top:33%, seg2 left:45%, seg3 top:78%
const DOTS = [
  // Segment 1: horizontal (top: 33%)
  { left: 14, top: 33, segment: 1 },
  { left: 22, top: 33, segment: 1 },
  { left: 30, top: 33, segment: 1 },
  { left: 38, top: 33, segment: 1 },
  { left: 44, top: 33, segment: 1 },
  // Segment 2: vertical (left: 45%)
  { left: 45, top: 39, segment: 2 },
  { left: 45, top: 51, segment: 2 },
  { left: 45, top: 63, segment: 2 },
  { left: 45, top: 75, segment: 2 },
  // Segment 3: horizontal (top: 78%)
  { left: 53, top: 78, segment: 3 },
  { left: 61, top: 78, segment: 3 },
  { left: 69, top: 78, segment: 3 },
  { left: 77, top: 78, segment: 3 },
  { left: 85, top: 78, segment: 3 },
  { left: 93, top: 78, segment: 3 },
];

/** Calculate when Pac-Man reaches each dot (as % of animation) - synced with CSS keyframes */
function getDotEatPercent(dot: { left: number; top: number; segment: number }): number {
  const MOUTH_OFFSET = 2; // dots disappear when Pac-Man's mouth reaches them (earlier = sooner)
  
  let percent = 0;
  if (dot.segment === 1) {
    // Segment 1: Pac-Man goes left -4% → 45% during 0-29%
    const progress = (dot.left - (-4)) / (45 - (-4));
    percent = progress * 29;
  } else if (dot.segment === 2) {
    // Segment 2: Pac-Man goes top 33% → 78% during 30-62%
    const progress = (dot.top - 33) / (78 - 33);
    percent = 30 + progress * 32;
  } else {
    // Segment 3: Pac-Man goes left 45% → 102% during 63-100%
    const progress = (dot.left - 45) / (102 - 45);
    percent = 63 + progress * 37;
  }
  
  return Math.max(1, percent - MOUTH_OFFSET);
}

/** Generate keyframes for each dot */
function getDotKeyframes(): string {
  const t = 'translate(-50%, -50%)'; // center dot on position
  return DOTS.map((dot, i) => {
    const eat = getDotEatPercent(dot).toFixed(1);
    const fadeEnd = Math.min(98, Number(eat) + 2);
    return `@keyframes pacman-dot-${i}{0%,${eat}%{opacity:1;transform:${t} scale(1)}${fadeEnd}%,99%{opacity:0;transform:${t} scale(0)}100%{opacity:1;transform:${t} scale(1)}}`;
  }).join('\n');
}

function GhostSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 50 50"
      className={className}
      style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))', ...style }}
    >
      <path
        d="M 8 22 Q 8 8 25 8 Q 42 8 42 22 L 42 42 Q 38 38 35 42 Q 32 38 25 42 Q 18 38 15 42 Q 12 38 8 42 Z"
        fill="#ef4444"
        stroke="#b91c1c"
        strokeWidth="1"
      />
      <ellipse cx="18" cy="20" rx="5" ry="6" fill="#fff" />
      <ellipse cx="32" cy="20" rx="5" ry="6" fill="#fff" />
      <circle cx="20" cy="20" r="2.5" fill="#1e40af" />
      <circle cx="34" cy="20" r="2.5" fill="#1e40af" />
    </svg>
  );
}

export default function PacmanBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    >
      <style dangerouslySetInnerHTML={{ __html: getDotKeyframes() }} />
      
      {/* Dots along the L path — centered on coordinates */}
      {DOTS.map((dot, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 shadow-md border-2 border-amber-400/60"
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            animation: `pacman-dot-${i} ${DURATION}s linear infinite`,
          }}
        />
      ))}
      
      {/* Pac-Man — mouth is transparent cutout (no black fill), opens and closes */}
      <div className="pacman-run w-10 h-10 sm:w-12 sm:h-12 overflow-visible">
        <svg
          viewBox="-4 -4 58 58"
          className="w-full h-full overflow-visible"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}
        >
          <path
            fill="#facc15"
            stroke="#eab308"
            strokeWidth="1.5"
            d="M 46.65 37.5 A 25 25 0 1 1 46.65 12.5 L 25 25 Z"
          >
            <animate
              attributeName="d"
              dur="0.2s"
              repeatCount="indefinite"
              values="
                M 46.65 37.5 A 25 25 0 1 1 46.65 12.5 L 25 25 Z;
                M 49.9 27.2 A 25 25 0 1 1 49.9 22.8 L 25 25 Z;
                M 46.65 37.5 A 25 25 0 1 1 46.65 12.5 L 25 25 Z
              "
            />
          </path>
        </svg>
      </div>
      
      {/* Ghost following behind */}
      <div className="pacman-ghost w-10 h-10 sm:w-12 sm:h-12">
        <GhostSvg className="w-full h-full" />
      </div>
    </div>
  );
}
