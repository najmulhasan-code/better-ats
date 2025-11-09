'use client';

interface TeamCollaborationAnimationProps {
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

export const TeamCollaborationAnimation: React.FC<TeamCollaborationAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Team members positioned around a central candidate profile
  const teamMembers = [
    { id: 0, x: 100, y: 80, delay: 0, name: 'HR' },
    { id: 1, x: 300, y: 80, delay: 5, name: 'Manager' },
    { id: 2, x: 100, y: 220, delay: 10, name: 'Team Lead' },
    { id: 3, x: 300, y: 220, delay: 15, name: 'Recruiter' },
  ];

  // Central candidate profile
  const candidateX = 200;
  const candidateY = 150;

  // Connection lines between team members and candidate
  const connections = teamMembers.map((member, i) => {
    const progress = spring({ frame: frame - (20 + i * 5), fps, config: { damping: 200, stiffness: 200 } });
    return { ...member, progress };
  });

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="collab-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#collab-clip)">
          {/* Central candidate profile */}
          <g transform={`translate(${candidateX}, ${candidateY})`}>
            <circle
              cx="0"
              cy="0"
              r="35"
              fill="#5371FE"
              opacity="0.2"
              style={{
                transform: `scale(${spring({ frame, fps, config: { damping: 200, stiffness: 200 } })})`,
              }}
            />
            <circle cx="0" cy="0" r="25" fill="#8B5CF6" opacity="0.3" />
            <circle cx="0" cy="0" r="15" fill="#5371FE" opacity="0.5" />
            
            {/* Candidate icon */}
            <text x="0" y="8" textAnchor="middle" fontSize="20" fill="#5371FE" fontWeight="bold">👤</text>
            
            {/* Pulsing rings */}
            {[0, 1, 2].map((i) => {
              const ringScale = 1 + Math.sin((frame + i * 10) * 0.1) * 0.15;
              const ringOpacity = 0.2 - i * 0.05;
              return (
                <circle
                  key={i}
                  cx="0"
                  cy="0"
                  r={35 + i * 8}
                  fill="none"
                  stroke="#5371FE"
                  strokeWidth="2"
                  opacity={ringOpacity}
                  style={{ transform: `scale(${ringScale})` }}
                />
              );
            })}
          </g>

          {/* Connection lines from team to candidate */}
          {connections.map((connection) => {
            if (connection.progress <= 0) return null;
            
            const member = teamMembers[connection.id];
            const x1 = member.x;
            const y1 = member.y;
            const x2 = candidateX;
            const y2 = candidateY;
            
            return (
              <line
                key={connection.id}
                x1={x1}
                y1={y1}
                x2={x1 + (x2 - x1) * connection.progress}
                y2={y1 + (y2 - y1) * connection.progress}
                stroke="#5371FE"
                strokeWidth="2"
                strokeDasharray="5,3"
                opacity={connection.progress * 0.6}
              />
            );
          })}

          {/* Team member avatars */}
          {teamMembers.map((member, i) => {
            const memberProgress = spring({ frame: frame - member.delay, fps, config: { damping: 200, stiffness: 200 } });
            const pulse = 1 + Math.sin((frame + i * 5) * 0.1) * 0.1;
            
            return (
              <g key={member.id} opacity={memberProgress}>
                {/* Avatar circle */}
                <circle
                  cx={member.x}
                  cy={member.y}
                  r="25"
                  fill="white"
                  stroke={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                  strokeWidth="3"
                  style={{
                    transform: `scale(${pulse})`,
                    transformOrigin: `${member.x}px ${member.y}px`,
                  }}
                />
                
                {/* Avatar icon */}
                <text
                  x={member.x}
                  y={member.y + 8}
                  textAnchor="middle"
                  fontSize="18"
                  fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                >
                  {i === 0 ? '👔' : i === 1 ? '👨‍💼' : i === 2 ? '👩‍💼' : '👤'}
                </text>
                
                {/* Member name badge */}
                <rect
                  x={member.x - 30}
                  y={member.y + 35}
                  width="60"
                  height="20"
                  fill={i % 2 === 0 ? '#5371FE' : '#8B5CF6'}
                  opacity="0.9"
                  rx="10"
                />
                <text
                  x={member.x}
                  y={member.y + 48}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {member.name}
                </text>
                
                {/* Activity indicator */}
                {frame > member.delay + 20 && (
                  <circle
                    cx={member.x + 20}
                    cy={member.y - 20}
                    r="6"
                    fill="#10B981"
                    opacity={0.8}
                  >
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Collaboration messages/bubbles */}
          {[
            { from: 0, to: candidateX, y: candidateY - 20, delay: 25, text: '✓ Reviewed' },
            { from: 1, to: candidateX, y: candidateY + 20, delay: 30, text: '💬 Feedback' },
            { from: 2, to: candidateX, y: candidateY - 40, delay: 35, text: '⭐ Approved' },
          ].map((message, i) => {
            const messageProgress = spring({ frame: frame - message.delay, fps, config: { damping: 200, stiffness: 200 } });
            if (messageProgress <= 0) return null;
            
            const fromMember = teamMembers[message.from];
            const x = fromMember.x + (message.to - fromMember.x) * messageProgress;
            const y = message.y;
            
            return (
              <g key={i} opacity={messageProgress}>
                <rect
                  x={x - 40}
                  y={y - 12}
                  width="80"
                  height="24"
                  fill="white"
                  stroke="#5371FE"
                  strokeWidth="2"
                  rx="12"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(83, 113, 254, 0.3))',
                  }}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#5371FE"
                  fontWeight="semibold"
                >
                  {message.text}
                </text>
              </g>
            );
          })}

          {/* Central collaboration indicator */}
          <g transform={`translate(${candidateX}, ${candidateY})`} opacity={spring({ frame: frame - 40, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="45" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="8,4" opacity="0.4">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0;360"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>
      </svg>
    </div>
  );
};

