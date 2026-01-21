import React from 'react';
import type { SavedWorkout } from '../types';
import WorkoutDisplay from './WorkoutDisplay';

interface SavedHistoryProps {
  workouts: SavedWorkout[];
  onBack: () => void;
}

const SavedHistory: React.FC<SavedHistoryProps> = ({ workouts, onBack }) => {
  const [selectedWorkout, setSelectedWorkout] = React.useState<SavedWorkout | null>(null);

  if (selectedWorkout) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Saved Workout</span>
            <h2 className="text-xl font-black text-white tracking-tighter-custom uppercase">{selectedWorkout.muscle} Focus</h2>
          </div>
          <button 
            onClick={() => setSelectedWorkout(null)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-all"
          >
            Close Workout
          </button>
        </div>
        <WorkoutDisplay plan={selectedWorkout.plan} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-8 bg-neutral-900/20 border border-neutral-800 rounded-3xl mb-8">
        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest-custom mb-3">Your Library</h3>
        <p className="text-2xl font-bold text-neutral-100 tracking-tighter-custom">
          Browse your previously generated training sessions.
        </p>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-neutral-900/10 border border-dashed border-neutral-800 rounded-[2rem] p-24 text-center">
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mb-8">No saved workouts yet</p>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
          >
            Create Your First Workout
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {workouts.map((sw) => (
            <button
              key={sw.id}
              onClick={() => setSelectedWorkout(sw)}
              className="w-full bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 text-left hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-emerald-500 font-black text-xs border border-neutral-700/50">
                  {new Date(sw.timestamp).getDate()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                      {new Date(sw.timestamp).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} • {new Date(sw.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-tighter-custom group-hover:text-emerald-500 transition-colors uppercase">
                    {sw.muscle} <span className="text-neutral-600">({sw.environment})</span>
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Workout
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedHistory;