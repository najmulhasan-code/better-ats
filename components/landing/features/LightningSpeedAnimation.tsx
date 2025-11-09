'use client';

interface LightningSpeedAnimationProps {
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

export const LightningSpeedAnimation: React.FC<LightningSpeedAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Processing documents - constrained within viewBox
  const documents = [
    { id: 0, x: 50, delay: 0 },
    { id: 1, x: 50, delay: 5 },
    { id: 2, x: 50, delay: 10 },
    { id: 3, x: 50, delay: 15 },
  ];

  documents.forEach((doc) => {
    const elapsed = Math.max(0, frame - doc.delay);
    doc.x = 50 + (elapsed / (fps * 0.5)) * 300; // Very fast movement
    if (doc.x > 350) doc.x = 50; // Loop back
  });

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="speed-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#speed-clip)">
          {/* Central lightning bolt */}
          <g transform="translate(200, 150)">
            <path
              d="M 0 -80 L -30 0 L -10 0 L 0 80 L 30 0 L 10 0 Z"
              fill="#5371FE"
              style={{
                transform: `scale(${1 + Math.sin(frame * 0.3) * 0.1})`,
                filter: 'drop-shadow(0 0 10px #5371FE)',
              }}
            />
            
            {/* Lightning glow */}
            <path
              d="M 0 -80 L -30 0 L -10 0 L 0 80 L 30 0 L 10 0 Z"
              fill="#8B5CF6"
              opacity="0.5"
              style={{
                transform: 'scale(1.2)',
                filter: 'blur(4px)',
              }}
            />
          </g>

          {/* Speed trail effect */}
          {documents.map((doc, i) => {
            if (doc.x <= 50) return null;
            
            const trailLength = 30;
            const trailOpacity = Math.min(1, (doc.x - 50) / 100);
            const docY = Math.max(50, Math.min(250, 120 + i * 20));
            
            return (
              <g key={doc.id}>
                {/* Document */}
                <g transform={`translate(${doc.x}, ${docY})`}>
                  <rect x="0" y="0" width="40" height="50" fill="white" stroke="#5371FE" strokeWidth="2" rx="4" />
                  <rect x="6" y="8" width="28" height="3" fill="#E5E7EB" rx="2" />
                  <rect x="6" y="14" width="24" height="3" fill="#E5E7EB" rx="2" />
                  <rect x="6" y="20" width="30" height="3" fill="#E5E7EB" rx="2" />
                </g>
                
                {/* Speed trail */}
                <line
                  x1={Math.max(0, doc.x - trailLength)}
                  y1={docY + 25}
                  x2={doc.x}
                  y2={docY + 25}
                  stroke="#8B5CF6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity={trailOpacity * 0.6}
                  style={{
                    strokeDasharray: '8,4',
                    strokeDashoffset: frame * 2,
                  }}
                />
              </g>
            );
          })}

          {/* Processing counter - constrained within bounds */}
          <g transform="translate(200, 250)">
            <rect x="-60" y="-20" width="120" height="40" fill="rgba(83, 113, 254, 0.1)" rx="20" />
            <text x="0" y="5" textAnchor="middle" fontSize="18" fill="#5371FE" fontWeight="bold">
              {Math.floor((frame / fps) * 10) % 1000}+
            </text>
            <text x="0" y="18" textAnchor="middle" fontSize="9" fill="#6B7280">processed/sec</text>
          </g>

          {/* Speed particles - constrained within viewBox */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const angle = (i * Math.PI * 2) / 12;
            const baseDistance = 100;
            const distance = baseDistance + Math.sin(frame * 0.2 + i) * 30;
            const x = Math.max(10, Math.min(390, 200 + Math.cos(angle) * distance));
            const y = Math.max(10, Math.min(290, 150 + Math.sin(angle) * distance));
            const particleSpeed = frame * 0.3 + i * 2;
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                opacity={0.7}
                style={{
                  transform: `rotate(${particleSpeed}deg)`,
                  transformOrigin: '200px 150px',
                }}
              />
            );
          })}

          {/* Speed lines radiating outward - constrained */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i * Math.PI * 2) / 8;
            const lineLength = Math.min(60, 60 + Math.sin(frame * 0.2 + i) * 20);
            const x1 = Math.max(10, Math.min(390, 200 + Math.cos(angle) * 40));
            const y1 = Math.max(10, Math.min(290, 150 + Math.sin(angle) * 40));
            const x2 = Math.max(10, Math.min(390, 200 + Math.cos(angle) * (40 + lineLength)));
            const y2 = Math.max(10, Math.min(290, 150 + Math.sin(angle) * (40 + lineLength)));
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#5371FE"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={0.6}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
