'use client';

interface ScoringRankingAnimationProps {
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

export const ScoringRankingAnimation: React.FC<ScoringRankingAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Candidates with scores
  const candidates = [
    { name: 'A', score: 95, x: 80, y: 80, delay: 0, points: 285 },
    { name: 'B', score: 87, x: 80, y: 140, delay: 5, points: 261 },
    { name: 'C', score: 78, x: 80, y: 200, delay: 10, points: 234 },
  ];

  // Ranking visualization
  const rankingX = 250;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="scoring-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#scoring-clip)">
          {/* Candidates with scores */}
          {candidates.map((candidate, i) => {
            const candidateProgress = spring({ frame: frame - candidate.delay, fps, config: { damping: 200, stiffness: 200 } });
            const scoreProgress = spring({ frame: frame - candidate.delay - 10, fps, config: { damping: 200, stiffness: 200 } });
            const barWidth = (candidate.score / 100) * 150 * scoreProgress;
            
            return (
              <g key={i} opacity={candidateProgress}>
                {/* Candidate card */}
                <rect
                  x={candidate.x - 35}
                  y={candidate.y - 20}
                  width="70"
                  height="40"
                  fill="white"
                  stroke="#5371FE"
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x={candidate.x}
                  y={candidate.y}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#5371FE"
                  fontWeight="bold"
                >
                  {candidate.name}
                </text>
                
                {/* Score bar */}
                <rect
                  x={rankingX - 75}
                  y={candidate.y - 8}
                  width={barWidth}
                  height="16"
                  fill={i === 0 ? '#10B981' : i === 1 ? '#5371FE' : '#8B5CF6'}
                  rx="8"
                />
                
                {/* Score percentage */}
                <text
                  x={rankingX + 80}
                  y={candidate.y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#5371FE"
                  fontWeight="bold"
                  opacity={scoreProgress}
                >
                  {candidate.score}%
                </text>
                
                {/* Points indicator */}
                <text
                  x={candidate.x}
                  y={candidate.y + 30}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6B7280"
                  opacity={scoreProgress}
                >
                  {candidate.points} pts
                </text>
              </g>
            );
          })}

          {/* ML ranking indicator */}
          <g transform="translate(200, 250)" opacity={spring({ frame: frame - 30, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-50" y="-15" width="100" height="30" fill="white" stroke="#8B5CF6" strokeWidth="2" rx="6" />
            <text x="0" y="5" textAnchor="middle" fontSize="11" fill="#8B5CF6" fontWeight="bold">🤖 ML Ranking</text>
          </g>

          {/* Custom weighting visualization */}
          <g transform="translate(320, 250)" opacity={spring({ frame: frame - 35, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="15" fill="#5371FE" opacity="0.2" />
            <text x="0" y="5" textAnchor="middle" fontSize="12" fill="#5371FE" fontWeight="bold">⚖️</text>
            <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#5371FE" fontWeight="semibold">Weight</text>
          </g>

          {/* Keyword matching visualization */}
          <g transform="translate(80, 250)" opacity={spring({ frame: frame - 40, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-35" y="-12" width="70" height="24" fill="white" stroke="#5371FE" strokeWidth="2" rx="6" />
            <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#5371FE" fontWeight="bold">🔑 Keywords</text>
          </g>

          {/* Predictive analytics indicator */}
          <g transform="translate(200, 50)" opacity={spring({ frame: frame - 45, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="20" fill="#10B981" opacity="0.2" />
            <text x="0" y="6" textAnchor="middle" fontSize="14" fill="#10B981" fontWeight="bold">📊</text>
            <text x="0" y="25" textAnchor="middle" fontSize="9" fill="#10B981" fontWeight="semibold">Predict</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
