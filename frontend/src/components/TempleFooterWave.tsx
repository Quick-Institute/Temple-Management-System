import type {JSX} from 'react';

export default function TempleFooterWave(): JSX.Element {
  return (
    <div className="relative w-full overflow-hidden leading-none select-none mt-10">
      {/* Wave SVG Canvas */}
      <svg
        className="relative block w-full h-[70px] sm:h-[95px] xl:h-[115px]"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="50%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#0C4A6E" />
          </linearGradient>
          <linearGradient id="waveGradAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#0284C7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="waveGradBack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* 1. Back Ambient Flowing Wave */}
        <path
          d="M0,45 C280,85 540,15 820,50 C1100,85 1300,25 1440,40 L1440,120 L0,120 Z"
          fill="url(#waveGradBack)"
        />

        {/* 2. Middle Sky Blue Curved Wave */}
        <path
          d="M0,60 C260,20 560,78 880,48 C1160,18 1320,62 1440,46 L1440,120 L0,120 Z"
          fill="url(#waveGradAccent)"
        />

        {/* 3. Front Solid Royal Navy/Sky Wave */}
        <path
          d="M0,78 C320,48 640,92 980,64 C1220,42 1360,72 1440,58 L1440,120 L0,120 Z"
          fill="url(#waveGradPrimary)"
        />

        {/* 4. Bottom-Right Silhouette: Sacred Pagoda / Stupa Spire & Bodhi Tree Leaves */}
        <g className="text-[#083344] opacity-45" fill="currentColor">
          {/* Stupa Spire Pinnacle */}
          <path d="M1365,120 L1365,48 L1370,55 L1370,120 Z" />
          <path d="M1358,68 C1358,62 1365,52 1365,48 C1365,52 1372,62 1372,68 C1370,72 1360,72 1358,68 Z" />
          <path d="M1352,82 C1352,72 1365,65 1365,65 C1365,65 1378,72 1378,82 C1374,86 1356,86 1352,82 Z" />
          <path d="M1345,100 C1345,86 1365,78 1365,78 C1365,78 1385,86 1385,100 C1378,105 1352,105 1345,100 Z" />
          <rect x="1338" y="100" width="54" height="20" rx="3" />

          {/* Bodhi Leaves Silhouettes reaching up on the far right */}
          {/* Leaf 1 */}
          <path d="M1410,95 C1410,75 1395,58 1390,48 C1385,58 1370,75 1370,95 C1370,105 1410,105 1410,95 Z" />
          <path d="M1390,48 L1390,105" stroke="currentColor" strokeWidth="1.5" />
          {/* Leaf 2 */}
          <path d="M1438,80 C1438,62 1425,48 1420,38 C1415,48 1402,62 1402,80 C1402,90 1438,90 1438,80 Z" />
          <path d="M1420,38 L1420,95" stroke="currentColor" strokeWidth="1.5" />
          {/* Leaf 3 */}
          <path d="M1380,110 C1380,95 1368,82 1364,74 C1360,82 1348,95 1348,110 C1348,118 1380,118 1380,110 Z" />
        </g>
      </svg>


    </div>
  );
}

export function GoldenLotusIcon({ className = 'w-6 h-6' }: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3c1.5 3 4.5 6 7 6-2 3-5 5-7 9-2-4-5-6-7-9 2.5 0 5.5-3 7-6z" />
      <path d="M12 12c-1.5 2-3 3-5 3.5 1-2 2-3.5 3-5" />
      <path d="M12 12c1.5 2 3 3 5 3.5-1-2-2-3.5-3-5" />
      <path d="M12 18c0 2-1 3-2 3.5" />
      <path d="M12 18c0 2 1 3 2 3.5" />
    </svg>
  );
}

