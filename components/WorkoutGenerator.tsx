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
    setError(null);
  };

  const handleGenerateWorkout = useCallback(async () => {
    if (!selectedBodyPart || !selectedMuscleId || !selectedEnvironmentId) return;

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    // GRAB THE KEY RIGHT HERE
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setError("CRITICAL: API Key not found in build. Please check Vercel Env Variables.");
      setIsLoading(false);
      return;
    }

    const muscle = selectedBodyPart.muscles.find(m => m.id === selectedMuscleId);
    const environment = WORKOUT_ENVIRONMENTS.find(e => e.id === selectedEnvironmentId);
    
    try {
      const generatedPlan = await generateWorkout(
        selectedBodyPart.name, 
        muscle?.name || 'Muscle', 
        environment?.name || 'Gym',
        apiKey // PASS IT MANUALLY
      );
      setWorkoutPlan(generatedPlan);
    } catch (err: any) {
      setError(`GENERATION ERROR: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBodyPart, selectedMuscleId, selectedEnvironmentId]);

  const handleSaveWorkout = async () => {
    if (!user || !workoutPlan) return;
    setIsSaving(true);
    const muscle = selectedBodyPart?.muscles.find(m => m.id === selectedMuscleId);
    const environment = WORKOUT_ENVIRONMENTS.find(e => e.id === selectedEnvironmentId);

    try {
      const { data, error: sbError } = await supabase
        .from('saved_workouts')
        .insert([{ 
          user_id: user.id, 
          payload: {
            bodyPart: selectedBodyPart?.name,
            muscle: muscle?.name,
            environment: environment?.name,
            plan: workoutPlan
          } 
        }])
        .select().single();

      if (sbError) throw sbError;
      setSaveSuccess(true);
      onSave({
        id: data.id,
        userId: user.id,
        timestamp: Date.now(),
        bodyPart: selectedBodyPart?.name || '',
        muscle: muscle?.name || '',
        environment: environment?.name || '',
        plan: workoutPlan
      });
    } catch (err: any) {
      setError("Save Failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return (
    <div className="space-y-4 text-center p-6 border border-red-500/20 rounded-2xl">
      <ErrorMessage message={error} />
      <button onClick={() => setError(null)} className="text-emerald-500 text-xs font-bold uppercase">Try Again</button>
    </div>
  );
  
  if (workoutPlan) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
          <div>
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Workout Summary</h3>
            <p className="text-white font-black text-lg uppercase tracking-tighter">
               {selectedBodyPart?.name} • {selectedBodyPart?.muscles.find(m => m.id === selectedMuscleId)?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setWorkoutPlan(null)} className="px-4 py-2 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase text-neutral-400">Back</button>
             {user ? (
               <button onClick={handleSaveWorkout} disabled={isSaving || saveSuccess} className="px-5 py-2 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest">
                 {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save Workout'}
               </button>
             ) : <span className="text-[10px] text-neutral-500 italic">Sign in to save</span>}
          </div>
        </div>
        <WorkoutDisplay plan={workoutPlan} />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
        <section className="bg-neutral-900/10 p-6 sm:p-8 rounded-[2rem] border border-neutral-800/40">
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-8">Step 1 // Choose Body Part</h2>
            <BodyPartSelector bodyParts={BODY_PARTS} selectedBodyPartId={selectedBodyPartId} onSelect={handleSelectBodyPart} />
        </section>

        {selectedBodyPart && (
            <section className="bg-neutral-900/10 p-6 sm:p-8 rounded-[2rem] border border-neutral-800/40">
                <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-8">Step 2 // Choose Muscle</h2>
                <MuscleSelector muscles={selectedBodyPart.muscles} selectedMuscleId={selectedMuscleId} onSelect={setSelectedMuscleId} />
            </section>
        )}

        {selectedMuscleId && (
            <section className="bg-neutral-900/10 p-6 sm:p-8 rounded-[2rem] border border-neutral-800/40">
                <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-8">Step 3 // Equipment</h2>
                <EnvironmentSelector environments={WORKOUT_ENVIRONMENTS} selectedEnvironmentId={selectedEnvironmentId} onSelect={setSelectedEnvironmentId} />
            </section>
        )}

        {selectedEnvironmentId && (
            <div className="pt-8 text-center">
                <button onClick={handleGenerateWorkout} className="w-full max-w-sm py-5 rounded-2xl bg-emerald-500 text-black font-black text-lg uppercase tracking-widest shadow-2xl shadow-emerald-500/10">
                    Create My Workout
                </button>
            </div>
        )}
    </div>
  );
}
