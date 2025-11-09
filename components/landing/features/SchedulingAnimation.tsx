'use client';

interface SchedulingAnimationProps {
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

export const SchedulingAnimation: React.FC<SchedulingAnimationProps> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  // Calendar slots
  const slots = [
    { x: 100, y: 100, time: '9:00 AM', delay: 0, booked: false },
    { x: 200, y: 100, time: '10:00 AM', delay: 5, booked: true },
    { x: 300, y: 100, time: '11:00 AM', delay: 10, booked: false },
    { x: 100, y: 180, time: '2:00 PM', delay: 15, booked: true },
    { x: 200, y: 180, time: '3:00 PM', delay: 20, booked: false },
    { x: 300, y: 180, time: '4:00 PM', delay: 25, booked: true },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="schedule-clip">
            <rect x="0" y="0" width="400" height="300" />
          </clipPath>
        </defs>
        
        <g clipPath="url(#schedule-clip)">
          {/* Calendar background */}
          <rect x="50" y="50" width="300" height="200" fill="white" stroke="#5371FE" strokeWidth="2" rx="8" />
          <text x="200" y="75" textAnchor="middle" fontSize="14" fill="#5371FE" fontWeight="bold">Calendar</text>
          
          {/* Time slots */}
          {slots.map((slot, i) => {
            const slotProgress = spring({ frame: frame - slot.delay, fps, config: { damping: 200, stiffness: 200 } });
            const isBooked = slot.booked && slotProgress > 0.5;
            
            return (
              <g key={i} opacity={slotProgress}>
                <rect
                  x={slot.x - 40}
                  y={slot.y - 15}
                  width="80"
                  height="30"
                  fill={isBooked ? '#5371FE' : '#F3F4F6'}
                  stroke={isBooked ? '#5371FE' : '#E5E7EB'}
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x={slot.x}
                  y={slot.y + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isBooked ? 'white' : '#6B7280'}
                  fontWeight={isBooked ? 'bold' : 'normal'}
                >
                  {slot.time}
                </text>
                
                {/* Booking indicator */}
                {isBooked && (
                  <circle
                    cx={slot.x + 30}
                    cy={slot.y - 10}
                    r="4"
                    fill="#10B981"
                    opacity={0.8}
                  >
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Video interview icon */}
          <g transform="translate(200, 250)" opacity={spring({ frame: frame - 30, fps, config: { damping: 200, stiffness: 200 } })}>
            <rect x="-40" y="-15" width="80" height="30" fill="white" stroke="#8B5CF6" strokeWidth="2" rx="6" />
            <text x="0" y="5" textAnchor="middle" fontSize="12" fill="#8B5CF6" fontWeight="bold">📹 Video</text>
          </g>

          {/* Self-scheduling indicator */}
          <g transform="translate(320, 250)" opacity={spring({ frame: frame - 35, fps, config: { damping: 200, stiffness: 200 } })}>
            <circle cx="0" cy="0" r="12" fill="#10B981" opacity="0.2" />
            <text x="0" y="5" textAnchor="middle" fontSize="14">✓</text>
            <text x="0" y="20" textAnchor="middle" fontSize="8" fill="#10B981" fontWeight="semibold">Self</text>
          </g>
        </g>
      </svg>
    </div>
  );
};

