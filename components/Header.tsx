import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center max-w-2xl mx-auto">
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter-custom text-white uppercase leading-none mb-6">
        Move <span className="text-emerald-500 italic">Better</span>
      </h1>
      
      <p className="text-neutral-400 text-base md:text-lg font-medium leading-relaxed">
        Personalized AI workouts and health advice designed to help you 
        reach your goals with total precision.
      </p>
      
      <div className="mt-8 flex justify-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </div>
    </header>
  );
};

export default Header;