'use client';

interface ResumeManagementAnimationProps {
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

export const ResumeManagementAnimation: React.FC<ResumeManagementAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Resumes being processed
  const resumes = [
    { x: 50, y: 80, delay: 0, progress: 0 },
    { x: 50, y: 150, delay: 10, progress: 0 },
    { x: 50, y: 220, delay: 20, progress: 0 },
  ];

  resumes.forEach((resume) => {
    const elapsed = Math.max(0, frame - resume.delay);
    resume.progress = Math.min(elapsed / (fps * 1.5), 1);
    resume.x = 50 + resume.progress * 300;
  });

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="resume-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#resume-clip)">
          {/* AI Processing zone */}
          <rect x="150" y="50" width="100" height="200" fill="rgba(83, 113, 254, 0.1)" rx="8" stroke="#5371FE" strokeWidth="2" strokeDasharray="5,5" />
          <text x="200" y="80" textAnchor="middle" fontSize="12" fill="#5371FE" fontWeight="bold">AI Processing</text>

          {/* Resumes */}
          {resumes.map((resume, i) => {
            if (resume.progress <= 0) return null;
            
            const inProcessingZone = resume.x > 150 && resume.x < 250;
            const isProcessed = resume.x > 250;
            const docScale = spring({ frame: frame - resume.delay, fps, config: { damping: 200, stiffness: 200 } });
            
            return (
              <g key={i} transform={`translate(${resume.x}, ${resume.y})`}>
                {/* Document */}
                <g style={{ transform: `scale(${docScale})`, transformOrigin: '0 0' }}>
                  <rect x="0" y="0" width="50" height="60" fill="white" stroke="#5371FE" strokeWidth="2" rx="4" />
                  <rect x="6" y="8" width="38" height="3" fill="#E5E7EB" rx="2" />
                  <rect x="6" y="14" width="32" height="3" fill="#E5E7EB" rx="2" />
                  <rect x="6" y="20" width="36" height="3" fill="#E5E7EB" rx="2" />
                  
                  {/* AI parsing indicator */}
                  {inProcessingZone && (
                    <g transform="translate(25, 30)">
                      {[0, 1, 2].map((j) => {
                        const angle = (frame * 0.2 + j * Math.PI * 2 / 3);
                        const radius = 8;
                        return (
                          <circle
                            key={j}
                            cx={Math.cos(angle) * radius}
                            cy={Math.sin(angle) * radius}
                            r="3"
                            fill="#5371FE"
                            opacity={0.8}
                          />
                        );
                      })}
                    </g>
                  )}
                  
                  {/* Checkmark when processed */}
                  {isProcessed && (
                    <g opacity={spring({ frame: frame - resume.delay - fps * 1.2, fps, config: { damping: 200, stiffness: 200 } })}>
                      <circle cx="25" cy="30" r="12" fill="#10B981" opacity="0.2" />
                      <path
                        d="M 18 30 L 22 34 L 32 24"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}
                </g>
              </g>
            );
          })}

          {/* Candidate database visualization */}
          <g transform="translate(320, 150)" opacity={spring({ frame: frame - 30, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-30" y="-40" width="60" height="80" fill="white" stroke="#8B5CF6" strokeWidth="2" rx="6" />
            <text x="0" y="-20" textAnchor="middle" fontSize="10" fill="#8B5CF6" fontWeight="bold">Database</text>
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x="-25"
                y={-10 + i * 15}
                width="50"
                height="12"
                fill="#E5E7EB"
                rx="2"
                opacity={0.6 + i * 0.1}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

