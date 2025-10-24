'use client';

import React from 'react';
import ClientOnlyWrapper from './client-only-wrapper';

const CosmicBackground = () => {
  return (
    <ClientOnlyWrapper>
      <div className="cosmic-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
    </ClientOnlyWrapper>
  );
};

export default CosmicBackground;
