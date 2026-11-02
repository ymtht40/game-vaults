// Variable Mapping: n -> LoaderIcon
// NOTE: module id: 461376

import { cn } from '@/libs/utils/className'; // NOTE: module id: 103746

function LoaderIcon({ size = 40, speed = "0.9", color = "var(--brand)", className }) {
  const parsedSize = Number(size) || 40;
  const parsedSpeed = Math.min(2, Math.max(0.5, 1 / (Number(speed) || 0.9)));

  return (
    <svg
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      width={parsedSize}
      height={parsedSize}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color, animationDuration: `${parsedSpeed}s` }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InlineLoader({ size = "20", speed = "0.9", color, className }) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      <LoaderIcon size={size} speed={speed} color={color} />
    </span>
  );
}

export default function Loader({ size = "40", speed = "0.9", className }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <LoaderIcon size={size} speed={speed} />
    </div>
  );
}
