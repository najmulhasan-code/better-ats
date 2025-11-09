'use client';

import { useEffect, useState, useRef } from 'react';

interface FeatureAnimationWrapperProps {
  Component: React.ComponentType<{ frame: number; fps: number }>;
  durationInFrames?: number;
  fps?: number;
}

export const FeatureAnimationWrapper: React.FC<FeatureAnimationWrapperProps> = ({
  Component,
  durationInFrames = 60,
  fps = 30,
}) => {
  const [frame, setFrame] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            startTimeRef.current = Date.now();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setFrame(0);
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentFrame = Math.floor((elapsed / 1000) * fps) % durationInFrames;
      setFrame(currentFrame);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, fps, durationInFrames]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Component frame={frame} fps={fps} />
    </div>
  );
};

