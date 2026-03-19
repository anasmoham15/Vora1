import React, { useState, useEffect } from 'react';
import type { Exercise, WorkoutPlan } from '../types';
import { getExerciseDetails } from '../services/exerciseService'; // NEW IMPORT
import { VideoCameraIcon, ArrowPathIcon } from './Icons';

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
}

const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ plan }) => {
  const [exercises, setExercises] = useState<Exercise[]>(plan?.exercises || []);

  useEffect(() => {
    setExercises(plan?.exercises || []);
  }, [plan]);

  const handleFetchTutorial = async (exerciseIndex: number) => {
    // 1. Set loading state
    setExercises(prev => prev.map((ex, i) => 
        i === exerciseIndex ? { ...ex, isVideoLoading: true, videoError: null } : ex
    ));

    try {
      // 2. Call our new ExerciseDB service
      const details = await getExerciseDetails(exercises[exerciseIndex].name);
      
      if (details) {
        setExercises(prev => prev.map((ex, i) => 
            i === exerciseIndex ? { 
              ...ex, 
              isVideoLoading: false, 
              videoUrl: details.gifUrl, // This is now the GIF URL
              // Optionally update instructions if the DB has better ones
              instructions: details.instructions?.length ? details.instructions : ex.instructions 
            } : ex
        ));
      } else {
        throw new Error("Not found");
      }
    } catch (err: any) {
      setExercises(prev => prev.map((ex, i) => 
          i === exerciseIndex ? { ...ex, isVideoLoading: false, videoError: "Tutorial GIF not found." } : ex
      ));
    }
  };

  return (
    <section className="space-y-12">
      <div className="p-8 bg-neutral-900/20 border-l-4 border-emerald-500 rounded-r-2xl">
        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest-custom mb-3">Goal of this Session</h3>
        <p className="text-2xl font-bold text-neutral-100 leading-snug tracking-tighter-custom max-w-2xl">
            {plan?.strategy}
        </p>
      </div>

      <div className="space-y-6">
        {exercises.map((exercise, index) => (
            <div key={index} className="bg-neutral-900/30 border border-neutral-800/60 rounded-3xl p-6 sm:p-10 transition-all hover:bg-neutral-900/40">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20">{index + 1}</span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest-custom">Exercise {index + 1}</span>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter-custom mb-4 uppercase">{exercise.name}</h3>
                        <p className="text-neutral-400 font-medium text-base leading-relaxed">{exercise.description}</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="flex-1 min-w-[100px] px-4 py-3 rounded-xl bg-black/40 border border-neutral-800 text-center">
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-0.5">Sets</span>
                            <span className="text-xl font-black text-white">{exercise.sets}</span>
                        </div>
                        <div className="flex-1 min-w-[100px] px-4 py-3 rounded-xl bg-black/40 border border-neutral-800 text-center">
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-0.5">Reps</span>
                            <span className="text-xl font-black text-white">{exercise.reps}</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-10">
                    <div className="bg-black/20 p-6 rounded-2xl border border-neutral-800/40">
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest-custom mb-6 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Instructions
                        </h4>
                        <ul className="space-y-4">
                        {(exercise.instructions || []).map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-4 text-neutral-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-700 flex-shrink-0"></div>
                                <span className="text-sm font-medium leading-relaxed">{step}</span>
                            </li>
                        ))}
                        </ul>
                    </div>

                    <div className="relative group/video">
                        {exercise.videoUrl ? (
                            <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl aspect-video flex items-center justify-center">
                                {/* CHANGED FROM IFRAME TO IMG FOR GIFS */}
                                <img 
                                  src={exercise.videoUrl} 
                                  alt={exercise.name} 
                                  className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => handleFetchTutorial(index)}
                                disabled={exercise.isVideoLoading}
                                className="w-full h-full min-h-[180px] rounded-2xl bg-neutral-900/50 border-2 border-dashed border-neutral-800 hover:border-emerald-500/30 hover:bg-neutral-800/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
                            >
                                {exercise.isVideoLoading ? (
                                    <div className="flex flex-col items-center gap-3">
                                      <ArrowPathIcon className="h-6 w-6 text-emerald-500 animate-spin" />
                                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest text-center">Fetching 3D Tutorial...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 rounded-full bg-neutral-800 text-neutral-500 group-hover:text-emerald-500 transition-colors">
                                          <VideoCameraIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest-custom group-hover:text-neutral-200">View 3D Form</span>
                                    </>
                                )}
                            </button>
                        )}
                        {exercise.videoError && (
                            <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{exercise.videoError}</p>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </section>
  );
};

export default WorkoutDisplay;
