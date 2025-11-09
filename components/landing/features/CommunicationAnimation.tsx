'use client';

interface CommunicationAnimationProps {
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

export const CommunicationAnimation: React.FC<CommunicationAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Email messages
  const emails = [
    { x: 80, y: 100, delay: 0, text: 'Welcome' },
    { x: 200, y: 100, delay: 10, text: 'Follow-up' },
    { x: 320, y: 100, delay: 20, text: 'Interview' },
  ];

  // CRM visualization
  const crmX = 200;
  const crmY = 200;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="comm-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#comm-clip)">
          {/* Email templates */}
          {emails.map((email, i) => {
            const emailProgress = spring({ frame: frame - email.delay, fps, config: { damping: 200, stiffness: 200 } });
            const sendProgress = spring({ frame: frame - email.delay - 15, fps, config: { damping: 200, stiffness: 200 } });
            
            return (
              <g key={i} opacity={emailProgress}>
                {/* Email icon */}
                <rect
                  x={email.x - 30}
                  y={email.y - 20}
                  width="60"
                  height="40"
                  fill="white"
                  stroke="#5371FE"
                  strokeWidth="2"
                  rx="4"
                  style={{ transform: `scale(${emailProgress})`, transformOrigin: `${email.x}px ${email.y}px` }}
                />
                <rect x={email.x - 25} y={email.y - 15} width="50" height="3" fill="#8B5CF6" rx="2" />
                <rect x={email.x - 25} y={email.y - 8} width="40" height="2" fill="#E5E7EB" rx="1" />
                <rect x={email.x - 25} y={email.y - 3} width="45" height="2" fill="#E5E7EB" rx="1" />
                
                {/* Email label */}
                <text
                  x={email.x}
                  y={email.y + 30}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#5371FE"
                  fontWeight="semibold"
                >
                  {email.text}
                </text>
                
                {/* Send animation */}
                {sendProgress > 0 && (
                  <g transform={`translate(${email.x}, ${email.y + 50})`}>
                    <path
                      d="M -10 0 L 0 -10 L 10 0 L 0 10 Z"
                      fill="#10B981"
                      opacity={sendProgress}
                      style={{ transform: `translateY(${-sendProgress * 30}px)` }}
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* CRM visualization */}
          <g transform={`translate(${crmX}, ${crmY})`} opacity={spring({ frame: frame - 30, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-50" y="-30" width="100" height="60" fill="white" stroke="#8B5CF6" strokeWidth="2" rx="8" />
            <text x="0" y="-10" textAnchor="middle" fontSize="12" fill="#8B5CF6" fontWeight="bold">CRM</text>
            
            {/* Candidate cards in CRM */}
            {[0, 1, 2].map((i) => {
              const cardX = -30 + i * 30;
              const cardY = 5;
              return (
                <g key={i}>
                  <rect
                    x={cardX - 10}
                    y={cardY}
                    width="20"
                    height="20"
                    fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                    opacity="0.3"
                    rx="4"
                  />
                  <circle cx={cardX} cy={cardY + 10} r="6" fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'} opacity="0.6" />
                </g>
              );
            })}
          </g>

          {/* Automated follow-up indicator */}
          <g transform="translate(100, 240)" opacity={spring({ frame: frame - 35, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="12" fill="#5371FE" opacity="0.2" />
            <circle cx="0" cy="0" r="8" fill="#5371FE" opacity="0.4" />
            <text x="0" y="5" textAnchor="middle" fontSize="12" fill="#5371FE" fontWeight="bold">⏰</text>
            <text x="0" y="25" textAnchor="middle" fontSize="9" fill="#5371FE" fontWeight="semibold">Auto</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

