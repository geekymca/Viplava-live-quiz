import React from 'react';

interface PageLoaderProps {
  message?: string;
  subtext?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Synchronizing Quiz Arena...',
  subtext = 'Connecting to high-speed Socket engine',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 select-none">
      {/* 3D-styled Holographic Ring Loader */}
      <div className="relative w-20 h-20 mb-5">
        {/* Outer glowing orbital ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin" />
        
        {/* Inner reverse spinner */}
        <div className="absolute inset-2.5 rounded-full border-2 border-indigo-500/20" />
        <div
          className="absolute inset-2.5 rounded-full border-2 border-transparent border-b-indigo-400 border-l-indigo-400 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
        />

        {/* Center Pulsing Reactor Core */}
        <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
          <div className="w-3 h-3 rounded-full bg-white animate-ping opacity-75" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-100 tracking-wide text-center">
        {message}
      </h3>
      <p className="text-xs text-slate-400 mt-1 text-center font-medium">
        {subtext}
      </p>
    </div>
  );
};
