'use client';

interface SourcingAnimationProps {
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

export const SourcingAnimation: React.FC<SourcingAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Job boards
  const boards = [
    { x: 80, y: 60, delay: 0, label: 'LinkedIn' },
    { x: 200, y: 60, delay: 5, label: 'Indeed' },
    { x: 320, y: 60, delay: 10, label: 'Glassdoor' },
  ];

  // Central job posting
  const jobX = 200;
  const jobY = 150;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="sourcing-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#sourcing-clip)">
          {/* Central job posting */}
          <g transform={`translate(${jobX}, ${jobY})`}>
            <rect
              x="-50"
              y="-30"
              width="100"
              height="60"
              fill="white"
              stroke="#5371FE"
              strokeWidth="3"
              rx="8"
              style={{
                transform: `scale(${spring({ frame, fps, config: { damping: 200, stiffness: 200 } })})`,
              }}
            />
            <text x="0" y="-5" textAnchor="middle" fontSize="12" fill="#5371FE" fontWeight="bold">Job Post</text>
            <rect x="-40" y="5" width="80" height="4" fill="#8B5CF6" rx="2" />
            <rect x="-30" y="12" width="60" height="4" fill="#8B5CF6" opacity="0.6" rx="2" />
          </g>

          {/* Job boards */}
          {boards.map((board, i) => {
            const boardProgress = spring({ frame: frame - board.delay, fps, config: { damping: 200, stiffness: 200 } });
            const connectionProgress = spring({ frame: frame - board.delay - 10, fps, config: { damping: 200, stiffness: 200 } });
            
            return (
              <g key={i} opacity={boardProgress}>
                {/* Connection line */}
                <line
                  x1={board.x}
                  y1={board.y + 20}
                  x2={jobX}
                  y2={jobY - 30}
                  stroke="#5371FE"
                  strokeWidth="2"
                  strokeDasharray="5,3"
                  opacity={connectionProgress * 0.5}
                />
                
                {/* Board card */}
                <rect
                  x={board.x - 40}
                  y={board.y}
                  width="80"
                  height="40"
                  fill="white"
                  stroke={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                  strokeWidth="2"
                  rx="6"
                  style={{ transform: `scale(${boardProgress})`, transformOrigin: `${board.x}px ${board.y + 20}px` }}
                />
                <text
                  x={board.x}
                  y={board.y + 25}
                  textAnchor="middle"
                  fontSize="11"
                  fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                  fontWeight="semibold"
                >
                  {board.label}
                </text>
                
                {/* Posting indicator */}
                {connectionProgress > 0.5 && (
                  <circle
                    cx={board.x}
                    cy={board.y + 35}
                    r="4"
                    fill="#10B981"
                    opacity={connectionProgress}
                  >
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Career site builder visualization */}
          <g transform="translate(200, 240)" opacity={spring({ frame: frame - 20, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-60" y="-15" width="120" height="30" fill="white" stroke="#8B5CF6" strokeWidth="2" rx="6" />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#8B5CF6" fontWeight="semibold">Career Site</text>
            <circle cx="-45" cy="0" r="3" fill="#5371FE" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="45" cy="0" r="3" fill="#5371FE" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
          </g>

          {/* Employee referral icon */}
          <g transform="translate(100, 240)" opacity={spring({ frame: frame - 25, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="15" fill="#5371FE" opacity="0.2" />
            <text x="0" y="5" textAnchor="middle" fontSize="16">👥</text>
            <text x="0" y="25" textAnchor="middle" fontSize="9" fill="#5371FE" fontWeight="semibold">Referrals</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

