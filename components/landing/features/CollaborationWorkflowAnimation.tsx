'use client';

interface CollaborationWorkflowAnimationProps {
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

export const CollaborationWorkflowAnimation: React.FC<CollaborationWorkflowAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Pipeline stages
  const stages = [
    { x: 80, y: 150, label: 'Applied', delay: 0 },
    { x: 160, y: 150, label: 'Screening', delay: 5 },
    { x: 240, y: 150, label: 'Interview', delay: 10 },
    { x: 320, y: 150, label: 'Offer', delay: 15 },
  ];

  // Team members
  const teamMembers = [
    { x: 100, y: 80, delay: 20, role: 'HR' },
    { x: 200, y: 80, delay: 25, role: 'Manager' },
    { x: 300, y: 80, delay: 30, role: 'Team Lead' },
  ];

  // Central candidate
  const candidateX = 200;
  const candidateY = 220;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="collab-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#collab-clip)">
          {/* Pipeline stages */}
          {stages.map((stage, i) => {
            const stageProgress = spring({ frame: frame - stage.delay, fps, config: { damping: 200, stiffness: 200 } });
            const isActive = i <= Math.floor((frame / fps) % 4);
            
            return (
              <g key={i} opacity={stageProgress}>
                {/* Stage box */}
                <rect
                  x={stage.x - 35}
                  y={stage.y - 20}
                  width="70"
                  height="40"
                  fill={isActive ? '#5371FE' : 'white'}
                  stroke={isActive ? '#5371FE' : '#E5E7EB'}
                  strokeWidth="2"
                  rx="6"
                  style={{ transform: `scale(${stageProgress})`, transformOrigin: `${stage.x}px ${stage.y}px` }}
                />
                <text
                  x={stage.x}
                  y={stage.y + 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isActive ? 'white' : '#6B7280'}
                  fontWeight="semibold"
                >
                  {stage.label}
                </text>
                
                {/* Arrow to next stage */}
                {i < stages.length - 1 && (
                  <line
                    x1={stage.x + 35}
                    y1={stage.y}
                    x2={stages[i + 1].x - 35}
                    y2={stages[i + 1].y}
                    stroke="#5371FE"
                    strokeWidth="2"
                    strokeDasharray="5,3"
                    opacity={stageProgress * 0.5}
                  />
                )}
              </g>
            );
          })}

          {/* Team members */}
          {teamMembers.map((member, i) => {
            const memberProgress = spring({ frame: frame - member.delay, fps, config: { damping: 200, stiffness: 200 } });
            const pulse = 1 + Math.sin((frame + i * 5) * 0.1) * 0.1;
            
            return (
              <g key={i} opacity={memberProgress}>
                {/* Avatar */}
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="20"
                  fill="white"
                  stroke={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                  strokeWidth="3"
                  style={{
                    transform: `scale(${pulse})`,
                    transformOrigin: `${member.x}px ${member.y}px`,
                  }}
                />
                <text
                  x={member.x}
                  y={member.y + 6}
                  textAnchor="middle"
                  fontSize="14"
                  fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                >
                  {i === 0 ? '👔' : i === 1 ? '👨‍💼' : '👩‍💼'}
                </text>
                
                {/* Role label */}
                <text
                  x={member.x}
                  y={member.y + 35}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6B7280"
                  fontWeight="semibold"
                >
                  {member.role}
                </text>
                
                {/* Connection to candidate */}
                <line
                  x1={member.x}
                  y1={member.y + 20}
                  x2={candidateX}
                  y2={candidateY - 20}
                  stroke="#5371FE"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  opacity={memberProgress * 0.4}
                />
              </g>
            );
          })}

          {/* Central candidate */}
          <g transform={`translate(${candidateX}, ${candidateY})`} opacity={spring({ frame: frame - 35, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="25" fill="#5371FE" opacity="0.2" />
            <circle cx="0" cy="0" r="18" fill="#8B5CF6" opacity="0.3" />
            <text x="0" y="8" textAnchor="middle" fontSize="18" fill="#5371FE" fontWeight="bold">👤</text>
            
            {/* Feedback indicators */}
            {[0, 1, 2].map((i) => {
              const angle = (i * Math.PI * 2) / 3;
              const distance = 35;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#10B981"
                  opacity={0.7}
                >
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>
              );
            })}
          </g>

          {/* Approval workflow indicator */}
          <g transform="translate(320, 240)" opacity={spring({ frame: frame - 40, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-40" y="-12" width="80" height="24" fill="white" stroke="#8B5CF6" strokeWidth="2" rx="6" />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#8B5CF6" fontWeight="bold">✓ Approval</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

