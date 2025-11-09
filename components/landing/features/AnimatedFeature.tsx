'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedFeatureProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export const AnimatedFeature: React.FC<AnimatedFeatureProps> = ({ children, isVisible }) => {
  const [frame, setFrame] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isVisible) {
      setFrame(0);
      return;
    }

    const startTime = Date.now();
    const fps = 30;
    const duration = 2000; // 2 seconds
    const totalFrames = (duration / 1000) * fps;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentFrame = Math.min(Math.floor((elapsed / duration) * totalFrames), totalFrames);
      setFrame(currentFrame);

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible]);

  return (
    <div style={{ '--frame': frame } as React.CSSProperties}>
      {children}
    </div>
  );
};

