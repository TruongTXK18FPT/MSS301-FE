'use client';

import { useEffect, useState } from 'react';
import ClientOnly from './client-only';

interface RandomParticle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

interface RandomParticlesProps {
  count: number;
  className?: string;
  children?: (particle: RandomParticle, index: number) => React.ReactNode;
}

export default function RandomParticles({ count, className = "", children }: RandomParticlesProps) {
  const [particles, setParticles] = useState<RandomParticle[]>([]);

  useEffect(() => {
    const generatedParticles = new Array(count).fill(null).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`
    }));
    setParticles(generatedParticles);
  }, [count]);

  return (
    <ClientOnly fallback={<div className={className} />}>
      <div className={className}>
        {particles.map((particle, i) => (
          <div key={`particle-${i}`} style={particle}>
            {children ? children(particle, i) : null}
          </div>
        ))}
      </div>
    </ClientOnly>
  );
}
