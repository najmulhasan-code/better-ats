'use client';

interface AnalyticsAnimationProps {
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

export const AnalyticsAnimation: React.FC<AnalyticsAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Bar chart data
  const bars = [
    { height: 0.8, delay: 0, color: '#5371FE' },
    { height: 1.0, delay: 5, color: '#8B5CF6' },
    { height: 0.6, delay: 10, color: '#5371FE' },
    { height: 0.9, delay: 15, color: '#8B5CF6' },
    { height: 0.7, delay: 20, color: '#5371FE' },
  ];

  // Line chart points - adjusted to fit within bounds
  const linePoints = [
    { x: 60, y: 140, delay: 25 },
    { x: 100, y: 100, delay: 30 },
    { x: 140, y: 120, delay: 35 },
    { x: 180, y: 80, delay: 40 },
    { x: 220, y: 90, delay: 45 },
    { x: 260, y: 70, delay: 50 },
  ];

  // Pie chart segments
  const pieSegments = [
    { percent: 0.35, color: '#5371FE', delay: 55 },
    { percent: 0.25, color: '#8B5CF6', delay: 60 },
    { percent: 0.20, color: '#5371FE', delay: 65 },
    { percent: 0.20, color: '#8B5CF6', delay: 70 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="analytics-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#analytics-clip)">
          {/* Dashboard background */}
          <rect x="20" y="20" width="360" height="260" fill="white" rx="12" stroke="#E5E7EB" strokeWidth="2" />
          
          {/* Title bar */}
          <rect x="20" y="20" width="360" height="40" fill="#F9FAFB" rx="12" />
          <rect x="20" y="20" width="360" height="2" fill="#5371FE" />
          <text x="200" y="45" textAnchor="middle" fontSize="16" fill="#1F2937" fontWeight="bold">Analytics Dashboard</text>

          {/* Bar Chart Section - Left */}
          <g transform="translate(40, 80)">
            <text x="0" y="-10" fontSize="12" fill="#6B7280" fontWeight="semibold">Applications</text>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 30}
                x2="120"
                y2={i * 30}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Bars */}
            {bars.map((bar, i) => {
              const barProgress = spring({ frame: frame - bar.delay, fps, config: { damping: 200, stiffness: 200 } });
              const barHeight = 120 * bar.height * barProgress;
              
              return (
                <g key={i}>
                  <rect
                    x={i * 25}
                    y={120 - barHeight}
                    width="20"
                    height={barHeight}
                    fill={bar.color}
                    rx="4"
                    opacity={0.8}
                  />
                  <text
                    x={i * 25 + 10}
                    y={Math.max(10, 125 - barHeight)}
                    textAnchor="middle"
                    fontSize="10"
                    fill={bar.color}
                    fontWeight="bold"
                    opacity={barProgress}
                  >
                    {Math.floor(bar.height * 100)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Line Chart Section - Top Right */}
          <g transform="translate(200, 80)">
            <text x="0" y="-10" fontSize="12" fill="#6B7280" fontWeight="semibold">Pipeline Trend</text>
            {/* Grid */}
            <rect x="0" y="0" width="140" height="80" fill="none" stroke="#E5E7EB" strokeWidth="1" />
            
            {/* Line path */}
            <path
              d={`M ${linePoints.map((p, i) => {
                const pointProgress = spring({ frame: frame - p.delay, fps, config: { damping: 200, stiffness: 200 } });
                if (i === 0) return `${p.x - 200},${p.y - 80}`;
                const prevPoint = linePoints[i - 1];
                const currentX = (p.x - 200) * pointProgress + (prevPoint.x - 200) * (1 - pointProgress);
                const currentY = (p.y - 80) * pointProgress + (prevPoint.y - 80) * (1 - pointProgress);
                return `L ${currentX},${currentY}`;
              }).join(' ')}`}
              fill="none"
              stroke="#5371FE"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {linePoints.map((point, i) => {
              const pointProgress = spring({ frame: frame - point.delay, fps, config: { damping: 200, stiffness: 200 } });
              return (
                <circle
                  key={i}
                  cx={point.x - 200}
                  cy={point.y - 80}
                  r="4"
                  fill="#8B5CF6"
                  opacity={pointProgress}
                  style={{ transform: `scale(${pointProgress})` }}
                />
              );
            })}
          </g>

          {/* Pie Chart Section - Bottom Right */}
          <g transform="translate(280, 180)">
            <text x="0" y="-10" fontSize="12" fill="#6B7280" fontWeight="semibold">Source</text>
            <g transform="translate(50, 50)">
              {pieSegments.map((segment, i) => {
                const segmentProgress = spring({ frame: frame - segment.delay, fps, config: { damping: 200, stiffness: 200 } });
                let startAngle = 0;
                for (let j = 0; j < i; j++) {
                  startAngle += pieSegments[j].percent * Math.PI * 2;
                }
                const endAngle = startAngle + segment.percent * Math.PI * 2 * segmentProgress;
                const radius = 35;
                
                const x1 = Math.cos(startAngle) * radius;
                const y1 = Math.sin(startAngle) * radius;
                const x2 = Math.cos(endAngle) * radius;
                const y2 = Math.sin(endAngle) * radius;
                const largeArc = segment.percent > 0.5 ? 1 : 0;
                
                return (
                  <path
                    key={i}
                    d={`M 0,0 L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={segment.color}
                    opacity={0.7 * segmentProgress}
                  />
                );
              })}
            </g>
          </g>

          {/* Real-time indicator - constrained within bounds */}
          <g transform="translate(350, 250)">
            <circle cx="0" cy="0" r="6" fill="#10B981">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="12" y="4" fontSize="10" fill="#10B981" fontWeight="semibold">Live</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
