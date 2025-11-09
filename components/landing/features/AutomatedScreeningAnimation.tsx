'use client';

interface AutomatedScreeningAnimationProps {
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

export const AutomatedScreeningAnimation: React.FC<AutomatedScreeningAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Resume documents moving on conveyor
  const resumes = [
    { id: 0, x: 50, delay: 0, progress: 0 },
    { id: 1, x: 50, delay: 20, progress: 0 },
    { id: 2, x: 50, delay: 40, progress: 0 },
  ];

  resumes.forEach((resume) => {
    const elapsed = Math.max(0, frame - resume.delay);
    resume.progress = Math.min(elapsed / (fps * 2), 1); // 2 seconds to process
    resume.x = 50 + resume.progress * 300;
  });

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        {/* Conveyor belt background */}
        <rect x="30" y="180" width="340" height="60" fill="#F3F4F6" rx="8" />
        <rect x="30" y="180" width="340" height="4" fill="#5371FE" opacity="0.3" />
        
        {/* Processing zone indicator */}
        <rect x="150" y="100" width="100" height="120" fill="rgba(83, 113, 254, 0.1)" rx="8" stroke="#5371FE" strokeWidth="2" strokeDasharray="5,5" />
        <text x="200" y="130" textAnchor="middle" fontSize="12" fill="#5371FE" fontWeight="bold">AI Processing</text>

        {/* Resume documents */}
        {resumes.map((resume) => {
          if (resume.progress <= 0) return null;
          
          const inProcessingZone = resume.x > 150 && resume.x < 250;
          const isProcessed = resume.x > 250;
          const docScale = spring({ frame: frame - resume.delay, fps, config: { damping: 200, stiffness: 200 } });
          const docRotation = inProcessingZone ? (resume.x - 150) / 100 * 10 : 0;
          
          return (
            <g key={resume.id} transform={`translate(${resume.x}, ${180 - resume.progress * 20})`}>
              {/* Document */}
              <g style={{ transform: `scale(${docScale}) rotate(${docRotation}deg)`, transformOrigin: '0 0' }}>
                <rect x="0" y="0" width="60" height="80" fill="white" stroke="#5371FE" strokeWidth="2" rx="4" />
                
                {/* Document content */}
                <rect x="8" y="12" width="44" height="4" fill="#E5E7EB" rx="2" />
                <rect x="8" y="20" width="36" height="3" fill="#E5E7EB" rx="2" />
                <rect x="8" y="26" width="40" height="3" fill="#E5E7EB" rx="2" />
                <rect x="8" y="32" width="32" height="3" fill="#E5E7EB" rx="2" />
                
                {/* Checkmark when processed */}
                {isProcessed && (
                  <g opacity={spring({ frame: frame - resume.delay - fps * 1.5, fps, config: { damping: 200, stiffness: 200 } })}>
                    <circle cx="30" cy="50" r="15" fill="#10B981" opacity="0.2" />
                    <path
                      d="M 22 50 L 28 56 L 38 44"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </g>
              
              {/* Processing indicator */}
              {inProcessingZone && (
                <g transform="translate(30, 40)">
                  {[0, 1, 2].map((i) => {
                    const angle = (frame * 0.2 + i * Math.PI * 2 / 3);
                    const radius = 8;
                    return (
                      <circle
                        key={i}
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
            </g>
          );
        })}

        {/* AI scanning beam */}
        <rect
          x={150 + Math.sin(frame * 0.1) * 50}
          y="100"
          width="4"
          height="120"
          fill="#8B5CF6"
          opacity="0.6"
          style={{
            boxShadow: '0 0 10px #8B5CF6',
          }}
        />

        {/* Stats display */}
        <g transform="translate(300, 50)">
          <rect x="0" y="0" width="80" height="100" fill="white" stroke="#5371FE" strokeWidth="2" rx="8" />
          <text x="40" y="20" textAnchor="middle" fontSize="10" fill="#6B7280" fontWeight="semibold">Processed</text>
          <text x="40" y="45" textAnchor="middle" fontSize="24" fill="#5371FE" fontWeight="bold">
            {Math.floor((frame / fps) * 2) % 1000}
          </text>
          <text x="40" y="65" textAnchor="middle" fontSize="10" fill="#6B7280">resumes</text>
          <text x="40" y="85" textAnchor="middle" fontSize="10" fill="#10B981" fontWeight="semibold">
            {Math.floor((frame / fps) * 2) % 1000 * 0.85}% Match
          </text>
        </g>

        {/* Floating success indicators */}
        {resumes.filter(r => r.x > 250).map((resume, i) => {
          const floatProgress = (frame - resume.delay - fps * 2) / (fps * 1);
          if (floatProgress < 0 || floatProgress > 1) return null;
          
          return (
            <g key={`success-${resume.id}`} transform={`translate(${resume.x + 30}, ${180 - 60 - floatProgress * 40})`}>
              <circle cx="0" cy="0" r="12" fill="#10B981" opacity={1 - floatProgress} />
              <path
                d="M -4 0 L 0 4 L 4 0"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={1 - floatProgress}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
