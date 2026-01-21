import React, { useState, useEffect } from 'react';
import type { User, WeeklyPlan, DayPlan, WeeklyPlannerConfig } from '../types';
import { generateWeeklyPlan } from '../services/geminiService';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

interface WeeklyPlannerProps { user: User | null; }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const GOAL_OPTIONS = ["Muscle Growth", "Strength Power", "Weight Loss", "General Health", "Endurance"];
const SPLIT_OPTIONS = ["Full Body", "Upper / Lower", "Push Pull Legs", "Bro Split", "Functional Athlete"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const FREQUENCY_OPTIONS = ["1 Day Per Week", "2 Days Per Week", "3 Days Per Week", "4 Days Per Week", "5 Days Per Week", "6 Days Per Week", "7 Days Per Week"];
const ENVIRONMENT_OPTIONS = ["Home", "Home Dumbbells", "Gym"];

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ user }) => {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WeeklyPlannerConfig>({
    goal: [GOAL_OPTIONS[0]],
    split: SPLIT_OPTIONS[0],
    level: LEVEL_OPTIONS[1],
    daysPerWeek: FREQUENCY_OPTIONS[3],
    environment: ENVIRONMENT_OPTIONS[2],
  });
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editActivities, setEditActivities] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vora_weekly_plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlan(parsed);
      } catch (e) { console.error("Failed to parse saved plan", e); }
    }
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newPlan = await generateWeeklyPlan(config);
      setPlan(newPlan);
      localStorage.setItem('vora_weekly_plan', JSON.stringify(newPlan));
    } catch (err) { setError("Failed to create plan. Try again."); } finally { setIsLoading(false); }
  };

  const startEdit = (day: string) => {
    if (!plan || !plan[day]) return;
    setEditingDay(day);
    setEditTitle(plan[day].title || '');
    setEditActivities((plan[day].activities || []).join('\n'));
  };

  const saveEdit = () => {
    if (!plan || !editingDay) return;
    const updatedPlan = { ...plan, [editingDay]: { title: editTitle, activities: editActivities.split('\n').filter(a => a.trim() !== '') } };
    setPlan(updatedPlan);
    localStorage.setItem('vora_weekly_plan', JSON.stringify(updatedPlan));
    setEditingDay(null);
  };

  const handleGoalToggle = (val: string) => {
    setConfig(prev => {
      const isSelected = prev.goal.includes(val);
      if (isSelected) {
        if (prev.goal.length <= 1) return prev;
        return { ...prev, goal: prev.goal.filter(g => g !== val) };
      } else { return { ...prev, goal: [...prev.goal, val] }; }
    });
  };

  const handleConfigChange = (key: keyof WeeklyPlannerConfig, value: any) => { setConfig(prev => ({ ...prev, [key]: value })); };

  const OptionGroup = ({ label, options, current, onSelect, columns = "grid-cols-2", multi = false }: { label: string, options: string[], current: string | string[], onSelect: (v: string) => void, columns?: string, multi?: boolean }) => (
    <div className="space-y-4">
      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest-custom ml-1">{label}</label>
      <div className={`grid grid-cols-1 sm:${columns} gap-2`}>
        {options.map(opt => {
          const isSelected = multi ? (current as string[]).includes(opt) : current === opt;
          return (
            <button key={opt} onClick={() => onSelect(opt)} className={`px-3 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <section className="space-y-12 animate-in fade-in duration-500 pb-24">
      <div className="p-6 md:p-8 bg-neutral-900/20 border border-neutral-800 rounded-[2.5rem]">
        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest-custom mb-3">Weekly Planner</h3>
        <p className="text-2xl font-bold text-neutral-100 tracking-tighter-custom mb-10">Schedule your movements for optimal results.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 mb-12">
          <OptionGroup label="Training Goals (Select multiple)" options={GOAL_OPTIONS} current={config.goal} onSelect={handleGoalToggle} multi={true} />
          <OptionGroup label="Training Split" options={SPLIT_OPTIONS} current={config.split} onSelect={(v) => handleConfigChange('split', v)} />
          <OptionGroup label="Experience Level" options={LEVEL_OPTIONS} current={config.level} onSelect={(v) => handleConfigChange('level', v)} columns="grid-cols-3" />
          <OptionGroup label="Frequency" options={FREQUENCY_OPTIONS} current={config.daysPerWeek} onSelect={(v) => handleConfigChange('daysPerWeek', v)} />
          <OptionGroup label="Environment" options={ENVIRONMENT_OPTIONS} current={config.environment} onSelect={(v) => handleConfigChange('environment', v)} columns="grid-cols-3" />
        </div>
        <button onClick={handleGenerate} className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98]">Generate Personalized Schedule</button>
        {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-6 text-center">{error}</p>}
      </div>
      {plan ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DAYS.map(day => {
            const dayData = plan[day];
            if (!dayData) return null;
            return (
              <div key={day} className="bg-neutral-900/30 border border-neutral-800/60 rounded-[2rem] p-7 group relative hover:border-neutral-700 transition-all">
                <div className="flex justify-between items-start mb-5">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{day}</span>
                  <button onClick={() => startEdit(day)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                  </button>
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter-custom mb-5 leading-tight">{dayData.title || 'Rest Day'}</h4>
                <ul className="space-y-4">
                  {(dayData.activities || []).map((act, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs font-medium text-neutral-400 leading-relaxed"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 flex-shrink-0"></div>{act}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : ( <div className="bg-neutral-900/10 border border-dashed border-neutral-800 rounded-[2rem] p-24 text-center"><p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] opacity-40">No schedule defined</p></div> )}
      {editingDay && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-[2.5rem] p-10 relative shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter-custom mb-8">Edit {editingDay}</h2>
            <div className="space-y-6">
              <div><label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-4">Daily Focus</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-black border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none transition-colors" /></div>
              <div><label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-4">Activities (One per line)</label><textarea rows={6} value={editActivities} onChange={(e) => setEditActivities(e.target.value)} className="w-full bg-black border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none transition-colors resize-none text-sm leading-relaxed" /></div>
              <div className="flex gap-4">
                <button onClick={() => setEditingDay(null)} className="flex-1 py-4 rounded-2xl border border-neutral-800 text-neutral-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Cancel</button>
                <button onClick={saveEdit} className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WeeklyPlanner;