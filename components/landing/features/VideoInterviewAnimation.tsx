'use client';

interface VideoInterviewAnimationProps {
  frame: number;
  fps: number;
}

const interpolate = (frame: number, input: number[], output: number[], options?: { extrapolateRight?: string }) => {
  if (frame <= input[0]) return output[0];
  if (frame >= input[input.length - 1]) {
    if (options?.extrapolateRight === 'clamp') return output[output.length - 1];
    if (options?.extrapolateRight === 'repeat') {
      const range = input[input.length - 1] - input[0];
      const normalized = ((frame - input[0]) % range) + input[0];
      return interpolate(normalized, input, output);
    }
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

export const VideoInterviewAnimation: React.FC<VideoInterviewAnimationProps> = ({ frame, fps }) => {
  const screenScale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 200 },
  });

  const personOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const playButtonOpacity = interpolate(frame, [0, 15], [1, 0], { extrapolateRight: 'clamp' });
  const recordingPulse = interpolate(frame, [0, 15, 30], [0.5, 1, 0.5], { extrapolateRight: 'repeat' });
  const aiWaveOpacity = interpolate(frame, [20, 35], [0, 0.6], { extrapolateRight: 'clamp' });

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          {/* Computer/Laptop Frame */}
          <rect x="50" y="40" width="300" height="200" fill="#1F2937" rx="8" stroke="#5371FE" strokeWidth="3" />
          <rect x="60" y="50" width="280" height="180" fill="#111827" rx="4" />
          
          {/* Screen bezel */}
          <rect x="45" y="35" width="310" height="210" fill="none" stroke="#374151" strokeWidth="2" rx="10" />
          
          {/* Video call interface - Person on screen */}
          <g opacity={personOpacity}>
            {/* Background gradient for video */}
            <defs>
              <linearGradient id="videoBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5371FE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect x="60" y="50" width="280" height="180" fill="url(#videoBg)" rx="4" />
            
            {/* Person silhouette/avatar */}
            <circle cx="200" cy="120" r="35" fill="#5371FE" opacity="0.4" />
            <ellipse cx="200" cy="100" rx="25" ry="20" fill="#8B5CF6" opacity="0.5" />
            <rect x="185" y="135" width="30" height="40" rx="15" fill="#5371FE" opacity="0.4" />
            
            {/* Speaking indicator waves */}
            {[0, 1, 2].map((i) => {
              const waveRadius = 40 + i * 15 + Math.sin((frame + i * 10) * 0.2) * 5;
              const waveOpacity = (0.3 - i * 0.1) * personOpacity;
              return (
                <circle
                  key={i}
                  cx="200"
                  cy="120"
                  r={waveRadius}
                  fill="none"
                  stroke="#5371FE"
                  strokeWidth="2"
                  opacity={waveOpacity}
                />
              );
            })}
          </g>

          {/* Play button overlay (disappears when video starts) */}
          <g opacity={playButtonOpacity}>
            <circle cx="200" cy="140" r="30" fill="rgba(0, 0, 0, 0.7)" />
            <polygon points="190,130 190,150 210,140" fill="white" />
          </g>

          {/* Recording indicator - Top right corner */}
          <g transform="translate(320, 60)">
            <circle cx="0" cy="0" r="12" fill="#EF4444" opacity={recordingPulse} />
            <circle cx="0" cy="0" r="8" fill="#EF4444" />
            <text x="0" y="25" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" opacity={recordingPulse}>
              REC
            </text>
          </g>

          {/* AI processing waves - Bottom */}
          <g opacity={aiWaveOpacity}>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M 80 ${200 + i * 8} Q 200 ${195 + i * 8}, 320 ${200 + i * 8}`}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                opacity={0.4 - i * 0.1}
                style={{
                  strokeDasharray: '8,4',
                  strokeDashoffset: (frame * 2 + i * 5) % 20,
                }}
              />
            ))}
          </g>

          {/* AI icon/badge - Bottom left */}
          <g transform="translate(80, 220)" opacity={aiWaveOpacity}>
            <circle cx="0" cy="0" r="12" fill="#5371FE" opacity="0.3" />
            <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#5371FE" fontWeight="bold">AI</text>
          </g>

          {/* Timer - Bottom right */}
          <text x="320" y="220" fontSize="14" fill="#8B5CF6" fontWeight="semibold" opacity={personOpacity}>
            {Math.floor((frame / fps) % 120)}s
          </text>
        </svg>
      </div>
    </div>
  );
};
