import { supabase } from '../supabaseClient';
import React, { useState, useMemo, useCallback } from 'react';
import BodyPartSelector from './BodyPartSelector';
import MuscleSelector from './MuscleSelector';
import EnvironmentSelector from './EnvironmentSelector';
import WorkoutDisplay from './WorkoutDisplay';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import { generateWorkout } from '../services/geminiService';
import { BODY_PARTS, WORKOUT_ENVIRONMENTS } from '../constants';
import type { WorkoutPlan, User, SavedWorkout } from '../types';

interface WorkoutGeneratorProps {
  user: User | null;
  onSave: (workout: SavedWorkout) => void;
}

export default function WorkoutGenerator({ user, onSave }: WorkoutGeneratorProps) {
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<string | null>(null);
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedBodyPart = useMemo(() => {
    return BODY_PARTS.find(part => part.id === selectedBodyPartId) || null;
  }, [selectedBodyPartId]);

  const handleSelectBodyPart = (bodyPartId: string) => {
    setSelectedBodyPartId(bodyPartId);
    setSelectedMuscleId(null);
    setSelectedEnvironmentId(null);
    setWorkoutPlan(null);
    setSaveSuccess(false);
  };

  const handleGenerateWorkout = useCallback(async () => {
    if (!selectedBodyPart || !selectedMuscleId || !selectedEnvironmentId) return;

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    const muscle = selectedBodyPart.muscles.find(m => m.id === selectedMuscleId);
    const environment = WORKOUT_ENVIRONMENTS.find(e => e.id === selectedEnvironmentId);
    
    try {
      const generatedPlan = await generateWorkout(selectedBodyPart.name, muscle!.name, environment!.name);
      setWorkoutPlan(generatedPlan);
    } catch (err) {
      setError("We couldn't generate your workout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBodyPart, selectedMuscleId, selectedEnvironmentId]);

  const handleSaveWorkout = async () => {
    if (!user || !workoutPlan) return;
    setIsSaving(true);
    setError(null);

    const muscle = selectedBodyPart?.muscles.find(m => m.id === selectedMuscleId);
    const environment = WORKOUT_ENVIRONMENTS.find(e => e.id === selectedEnvironmentId);

    const savedWorkoutData = {
      bodyPart: selectedBodyPart?.name || 'Unknown',
      muscle: muscle?.name || 'Unknown',
      environment: environment?.name || 'Unknown',
      plan: workoutPlan
    };

    try {
      const { data, error: sbError } = await supabase
        .from('saved_workouts')
        .insert([{ user_id: user.id, payload: savedWorkoutData }])
        .select().single();

      if (sbError) throw sbError;

      onSave({
        id: data.id,
        userId: user.id,
        timestamp: Date.now(),
        ...savedWorkoutData
      });
      setSaveSuccess(true);
    } catch (err: any) {
      console.error("Save failed:", err.message);
      setError("Failed to save workout to the cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  
  if (workoutPlan) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
          <div>
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest-custom mb-1">Workout Summary</h3>
            <p className="text-white font-black text-lg tracking-tighter-custom uppercase">
               {selectedBodyPart?.name} • {selectedBodyPart?.muscles.find(m => m.id === selectedMuscleId)?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => { setWorkoutPlan(null); setSaveSuccess(false); }} className="px-4 py-2 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase text-neutral-400 hover:text-white transition-colors">Start Over</button>
             {user ? (
               <button 
                 onClick={handleSaveWorkout} 
                 disabled={isSaving || saveSuccess} 
                 className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${saveSuccess ? 'bg-neutral-800 text-emerald-500 border border-emerald-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
               >
                 {isSaving ? 'Saving...' : saveSuccess ? 'Workout Saved' : 'Save Workout'}
               </button>
             ) : <div className="px-5 py-2 rounded-lg bg-neutral-800/50 border border-neutral-800 text-[10px] font-bold text-neutral-600">Sign In to Save</div>}
          </div>
        </div>
        <WorkoutDisplay plan={workoutPlan} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
        <section className="bg-neutral-900/10 p-6 sm:p-8 rounded-[2rem] border border-neutral-800/40">
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest-custom mb-8 pb-4 border-b border-neutral-800/50">Step 1 // Choose Body Part</h2>
            <BodyPartSelector bodyParts={BODY_PARTS} selectedBodyPartId={selectedBodyPartId} onSelect={handleSelectBodyPart} />
        </section>

        {selectedBodyPart && (
            <section className="bg-neutral-900/10 p-6 sm:p-8 rounded-[2rem] border border-neutral-800/40 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest-custom mb-8 pb-4 border-b border-neutral-800/50">Step 2 // Choose Specific Muscle</h2>
                <MuscleSelector muscles={selectedBodyPart.muscles} selectedMuscleId={selectedMuscleId} onSelect={setSelectedMuscleId} />
            </section>
        )}

        {selectedMuscleId && (
            <section className="bg-neutral-900/10 p-6 sm:p-8 rounded-[2rem] border border-neutral-800/40 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest-custom mb-8 pb-4 border-b border-neutral-800/50">Step 3 // Where are you?</h2>
                <EnvironmentSelector environments={WORKOUT_ENVIRONMENTS} selectedEnvironmentId={selectedEnvironmentId} onSelect={setSelectedEnvironmentId} />
            </section>
        )}

        {selectedEnvironmentId && (
            <div className="pt-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <button onClick={handleGenerateWorkout} className="w-full max-w-sm py-5 rounded-2xl bg-emerald-500 text-black font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] shadow-2xl shadow-emerald-500/10 active:scale-95">
                    Create My Workout
                </button>
            </div>
        )}
    </div>
  );
}
