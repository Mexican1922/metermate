export function MeterMateLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <rect width="512" height="512" rx="108" fill="currentColor" opacity="0.1" />
      {/* Meter circle */}
      <circle
        cx="256"
        cy="256"
        r="170"
        stroke="currentColor"
        strokeWidth="20"
        fill="none"
      />
      {/* Tick marks */}
      <line x1="256" y1="96" x2="256" y2="116" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <line x1="256" y1="396" x2="256" y2="416" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <line x1="96" y1="256" x2="116" y2="256" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <line x1="396" y1="256" x2="416" y2="256" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      <line x1="143" y1="143" x2="157" y2="157" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="369" y1="143" x2="355" y2="157" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="143" y1="369" x2="157" y2="355" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="369" y1="369" x2="355" y2="355" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      {/* Lightning bolt */}
      <path d="M280 120 L220 255 L270 255 L232 392 L320 235 L265 235 Z" fill="currentColor" />
      {/* Center dot */}
      <circle cx="256" cy="256" r="14" fill="currentColor" />
    </svg>
  );
}
