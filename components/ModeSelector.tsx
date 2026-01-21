import React from 'react';
import { DumbbellIcon, HeartIcon, BuildingLibraryIcon, ArrowPathIcon, BookOpenIcon } from './Icons';
import type { User } from '../types';

interface ModeSelectorProps {
  onSelectMode: (mode: 'workout' | 'health' | 'history' | 'planner' | 'dictionary') => void;
  user: User | null;
  onAuthClick: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode, user, onAuthClick }) => {
  return (
    <section className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Workout Module */}
        <button
          onClick={() => onSelectMode('workout')}
          className="group relative flex flex-col items-start p-8 rounded-[1.5rem] bg-neutral-900/40 border border-neutral-800/50 hover:border-emerald-500/50 transition-all duration-300 text-left overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5"
        >
          <div className="p-4 rounded-xl bg-neutral-800 text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-all">
            <DumbbellIcon className="h-7 w-7" />
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter-custom">
              Create Workout
            </h3>
            <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 tracking-widest">AI</span>
          </div>
          <p className="text-neutral-500 leading-relaxed text-sm font-medium mb-6">
            Get a personal exercise plan based on your body, goals, and available equipment.
          </p>
          <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
            Start Generating
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 transition-transform group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>

        {/* Health Module */}
        <button
          onClick={() => onSelectMode('health')}
          className="group relative flex flex-col items-start p-8 rounded-[1.5rem] bg-neutral-900/40 border border-neutral-800/50 hover:border-emerald-500/50 transition-all duration-300 text-left overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5"
        >
          <div className="p-4 rounded-xl bg-neutral-800 text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-all">
            <HeartIcon className="h-7 w-7" />
          </div>
          
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter-custom">
            Health Check
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm font-medium mb-6">
            A quick analysis of your lifestyle habits and tips on how to improve your wellbeing.
          </p>
          <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
            Check Progress
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 transition-transform group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>

        {/* Dictionary Module */}
        <button
          onClick={() => onSelectMode('dictionary')}
          className="group relative flex flex-col items-start p-8 rounded-[1.5rem] bg-neutral-900/40 border border-neutral-800/50 hover:border-emerald-500/50 transition-all duration-300 text-left overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5"
        >
          <div className="p-4 rounded-xl bg-neutral-800 text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-black transition-all">
            <BookOpenIcon className="h-7 w-7" />
          </div>
          
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter-custom">
            Exercise Guide
          </h3>
          <p className="text-neutral-500 leading-relaxed text-sm font-medium mb-6">
            Search our comprehensive dictionary to master the technique of any exercise.
          </p>
          <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest">
            Browse Dictionary
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 transition-transform group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      </div>

      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode('history')}
            className="bg-neutral-900/20 border border-neutral-800/50 rounded-[1.5rem] p-8 flex items-center justify-between group hover:border-neutral-700 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <BuildingLibraryIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-black text-white tracking-tighter-custom uppercase">Saved Workouts</h4>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Archived training history</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('planner')}
            className="bg-neutral-900/20 border border-neutral-800/50 rounded-[1.5rem] p-8 flex items-center justify-between group hover:border-neutral-700 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                <ArrowPathIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-black text-white tracking-tighter-custom uppercase">Weekly Planner</h4>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Personalized schedule</p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-neutral-900/10 border border-dashed border-neutral-800 rounded-[1.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="text-center md:text-left">
              <h4 className="text-lg font-black text-white tracking-tighter-custom uppercase mb-1">Save Your Progress</h4>
              <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">Create an account to track all your sessions</p>
           </div>
           <button 
             onClick={onAuthClick}
             className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-black transition-all"
           >
             Join Now
           </button>
        </div>
      )}
    </section>
  );
};

export default ModeSelector;