'use client';

interface SecurityAnimationProps {
  frame: number;
  fps: number;
}

const interpolate = (frame: number, input: number[], output: number[], options?: { extrapolateRight?: string }) => {
  if (frame <= input[0]) return output[0];
  if (frame >= input[input.length - 1]) {
    if (options?.extrapolateRight === 'clamp') return output[output.length - 1];
    return output[output.length - 1];
  }
  
  for (let i = 0; i < input.length - 1; i++) {
    if (frame >= input[i] && frame <= input[i + 1]) {
      const t = (frame - input[i]) / (input[i + 1] - input[i]);
      return output[i] + (output[i + 1] - output[i]) * t;
    }
  }
  return output[0];
};

const spring = ({ frame, fps, config }: { frame: number; fps: number; config: { damping: number; stiffness: number } }) => {
  const { damping, stiffness } = config;
  const progress = Math.min(frame / (fps * 0.5), 1);
  return 1 - Math.exp(-(stiffness / damping) * progress);
};

export const SecurityAnimation: React.FC<SecurityAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Multi-layer security visualization
  const layers = [
    { radius: 120, delay: 0, color: '#5371FE' },
    { radius: 90, delay: 10, color: '#8B5CF6' },
    { radius: 60, delay: 20, color: '#5371FE' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        {/* Outer security perimeter */}
        {layers.map((layer, i) => {
          const layerProgress = spring({ frame: frame - layer.delay, fps, config: { damping: 200, stiffness: 200 } });
          const pulse = 1 + Math.sin((frame + i * 20) * 0.1) * 0.1;
          
          return (
            <g key={i} transform="translate(200, 150)">
              <circle
                cx="0"
                cy="0"
                r={layer.radius * layerProgress * pulse}
                fill="none"
                stroke={layer.color}
                strokeWidth="3"
                opacity={0.3 - i * 0.1}
                strokeDasharray="10,5"
                style={{
                  strokeDashoffset: frame * 0.5 + i * 10,
                }}
              />
            </g>
          );
        })}

        {/* Central shield */}
        <g transform="translate(200, 150)">
          <path
            d="M 0 -60 L 50 -30 L 50 30 L 0 60 L -50 30 L -50 -30 Z"
            fill="#5371FE"
            opacity="0.2"
            stroke="#5371FE"
            strokeWidth="4"
            style={{
              transform: `scale(${spring({ frame, fps, config: { damping: 200, stiffness: 200 } })})`,
            }}
          />
          
          {/* Lock icon inside shield */}
          <g transform="translate(0, 10)">
            <rect x="-20" y="0" width="40" height="30" fill="#8B5CF6" rx="4" />
            <path
              d="M -15 0 L -15 -15 Q -15 -20, -10 -20 L 10 -20 Q 15 -20, 15 -15 L 15 0"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Security badges/certifications */}
        {[
          { label: 'GDPR', x: 80, y: 80, delay: 30 },
          { label: 'SOC 2', x: 320, y: 80, delay: 35 },
          { label: 'SSL', x: 80, y: 220, delay: 40 },
          { label: '256-bit', x: 320, y: 220, delay: 45 },
        ].map((badge, i) => {
          const badgeProgress = spring({ frame: frame - badge.delay, fps, config: { damping: 200, stiffness: 200 } });
          
          return (
            <g key={i} opacity={badgeProgress}>
              <rect
                x={badge.x - 35}
                y={badge.y - 20}
                width="70"
                height="40"
                fill="white"
                stroke={badge.label.includes('SOC') ? '#8B5CF6' : '#5371FE'}
                strokeWidth="2"
                rx="8"
                style={{ transform: `scale(${badgeProgress})`, transformOrigin: `${badge.x}px ${badge.y}px` }}
              />
              <text
                x={badge.x}
                y={badge.y + 5}
                textAnchor="middle"
                fontSize="12"
                fill={badge.label.includes('SOC') ? '#8B5CF6' : '#5371FE'}
                fontWeight="bold"
              >
                {badge.label}
              </text>
            </g>
          );
        })}

        {/* Encryption particles */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const angle = (i * Math.PI * 2) / 9 + frame * 0.05;
          const distance = 100 + Math.sin(frame * 0.1 + i) * 20;
          const x = 200 + Math.cos(angle) * distance;
          const y = 150 + Math.sin(angle) * distance;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
              opacity={0.6}
            />
          );
        })}

        {/* Security checkmark */}
        <g transform="translate(200, 150)" opacity={spring({ frame: frame - 50, fps, config: { damping: 200, stiffness: 200 } })}>
          <circle cx="0" cy="0" r="25" fill="#10B981" opacity="0.2" />
          <path
            d="M -8 0 L -2 6 L 8 -4"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
