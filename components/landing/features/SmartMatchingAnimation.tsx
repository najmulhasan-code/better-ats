'use client';

interface SmartMatchingAnimationProps {
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

const spring = ({ frame, fps, config }: { frame: number; fps: number; config: { damping: number; stiffness: number; mass: number } }) => {
  const { damping, stiffness } = config;
  const progress = Math.min(frame / (fps * 0.5), 1);
  return 1 - Math.exp(-(stiffness / damping) * progress);
};

export const SmartMatchingAnimation: React.FC<SmartMatchingAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Candidate profiles (left side) - adjusted to fit within viewBox
  const candidates = [
    { id: 0, x: 80, y: 80, delay: 0 },
    { id: 1, x: 80, y: 150, delay: 5 },
    { id: 2, x: 80, y: 220, delay: 10 },
  ];

  // Job requirements (right side) - adjusted to fit within viewBox
  const jobs = [
    { id: 0, x: 320, y: 80, delay: 15 },
    { id: 1, x: 320, y: 150, delay: 20 },
    { id: 2, x: 320, y: 220, delay: 25 },
  ];

  // Matching connections
  const matches = [
    { from: 0, to: 0, progress: spring({ frame: frame - 30, fps, config: { damping: 200, stiffness: 200, mass: 0.5 } }) },
    { from: 1, to: 1, progress: spring({ frame: frame - 35, fps, config: { damping: 200, stiffness: 200, mass: 0.5 } }) },
    { from: 2, to: 0, progress: spring({ frame: frame - 40, fps, config: { damping: 200, stiffness: 200, mass: 0.5 } }) },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="animation-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#animation-clip)">
          {/* Central AI brain/processor */}
          <g transform="translate(200, 150)">
            <circle cx="0" cy="0" r="35" fill="#5371FE" opacity="0.2" />
            <circle cx="0" cy="0" r="25" fill="#8B5CF6" opacity="0.3" />
            <circle cx="0" cy="0" r="15" fill="#5371FE" opacity="0.5" />
            
            {/* Pulsing rings */}
            {[0, 1, 2].map((i) => {
              const ringScale = 1 + Math.sin((frame + i * 10) * 0.1) * 0.2;
              const ringOpacity = 0.3 - i * 0.1;
              return (
                <circle
                  key={i}
                  cx="0"
                  cy="0"
                  r={35 + i * 10}
                  fill="none"
                  stroke="#5371FE"
                  strokeWidth="2"
                  opacity={ringOpacity}
                  style={{ transform: `scale(${ringScale})` }}
                />
              );
            })}
          </g>

          {/* Candidate profiles */}
          {candidates.map((candidate, i) => {
            const cardOpacity = interpolate(frame, [candidate.delay, candidate.delay + 10], [0, 1], { extrapolateRight: 'clamp' });
            const cardScale = spring({ frame: frame - candidate.delay, fps, config: { damping: 200, stiffness: 200, mass: 0.5 } });
            
            return (
              <g key={candidate.id} opacity={cardOpacity}>
                <rect
                  x={candidate.x - 50}
                  y={candidate.y - 25}
                  width="100"
                  height="50"
                  fill="white"
                  stroke="#5371FE"
                  strokeWidth="2"
                  rx="8"
                  style={{ transform: `scale(${cardScale})`, transformOrigin: `${candidate.x}px ${candidate.y}px` }}
                />
                <circle cx={candidate.x - 30} cy={candidate.y} r="12" fill="#5371FE" opacity="0.3" />
                <rect x={candidate.x - 10} y={candidate.y - 8} width="30" height="4" fill="#8B5CF6" rx="2" />
                <rect x={candidate.x - 10} y={candidate.y + 4} width="40" height="4" fill="#8B5CF6" opacity="0.6" rx="2" />
              </g>
            );
          })}

          {/* Job requirements */}
          {jobs.map((job, i) => {
            const cardOpacity = interpolate(frame, [job.delay, job.delay + 10], [0, 1], { extrapolateRight: 'clamp' });
            const cardScale = spring({ frame: frame - job.delay, fps, config: { damping: 200, stiffness: 200, mass: 0.5 } });
            
            return (
              <g key={job.id} opacity={cardOpacity}>
                <rect
                  x={job.x - 50}
                  y={job.y - 25}
                  width="100"
                  height="50"
                  fill="white"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  rx="8"
                  style={{ transform: `scale(${cardScale})`, transformOrigin: `${job.x}px ${job.y}px` }}
                />
                <rect x={job.x - 40} y={job.y - 12} width="80" height="6" fill="#5371FE" rx="3" />
                <rect x={job.x - 30} y={job.y - 2} width="60" height="4" fill="#8B5CF6" opacity="0.6" rx="2" />
                <rect x={job.x - 20} y={job.y + 6} width="40" height="4" fill="#8B5CF6" opacity="0.4" rx="2" />
              </g>
            );
          })}

          {/* Matching connection lines */}
          {matches.map((match, i) => {
            const fromCandidate = candidates[match.from];
            const toJob = jobs[match.to];
            const lineProgress = match.progress;
            
            if (lineProgress <= 0) return null;
            
            const x1 = fromCandidate.x;
            const y1 = fromCandidate.y;
            const x2 = toJob.x;
            const y2 = toJob.y;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x1 + (x2 - x1) * lineProgress}
                  y2={y1 + (y2 - y1) * lineProgress}
                  stroke="#5371FE"
                  strokeWidth="3"
                  strokeDasharray="5,3"
                  opacity={lineProgress * 0.8}
                />
                
                {/* Matching sparkle at connection point */}
                {lineProgress > 0.9 && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    {[0, 1, 2, 3].map((j) => {
                      const angle = (j * Math.PI * 2) / 4 + frame * 0.1;
                      const distance = 15;
                      return (
                        <circle
                          key={j}
                          cx={Math.cos(angle) * distance}
                          cy={Math.sin(angle) * distance}
                          r="4"
                          fill="#8B5CF6"
                          opacity={0.8}
                        />
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}

          {/* Match percentage indicators - constrained within viewBox */}
          {matches.map((match, i) => {
            if (match.progress < 0.5) return null;
            const fromCandidate = candidates[match.from];
            const toJob = jobs[match.to];
            const midX = (fromCandidate.x + toJob.x) / 2;
            const midY = Math.max(30, Math.min(270, (fromCandidate.y + toJob.y) / 2 - 20));
            const percentage = Math.floor(match.progress * 100);
            
            return (
              <g key={i} opacity={match.progress}>
                <circle cx={midX} cy={midY} r="20" fill="#5371FE" opacity="0.2" />
                <text x={midX} y={midY + 5} textAnchor="middle" fontSize="14" fill="#5371FE" fontWeight="bold">
                  {percentage}%
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
