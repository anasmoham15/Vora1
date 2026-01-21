import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-16 h-[2px] bg-neutral-900 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 h-full bg-green-500 w-1/2 animate-loading-slide"></div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500">Creating your plan</p>
      
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-loading-slide {
          animation: loading-slide 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;