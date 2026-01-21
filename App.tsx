import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import WorkoutGenerator from './components/WorkoutGenerator';
import HealthCheck from './components/HealthCheck';
import AuthModal from './components/AuthModal';
import SavedHistory from './components/SavedHistory';
import WeeklyPlanner from './components/WeeklyPlanner';
import ExerciseDictionary from './components/ExerciseDictionary';
import { ArrowLeftIcon, VoraLogo } from './components/Icons';
import type { User, SavedWorkout } from './types';

type Mode = 'workout' | 'health' | 'history' | 'planner' | 'dictionary' | null;

export default function App() {
  const [mode, setMode] = useState<Mode>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('vora_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserWorkouts(parsedUser.id);
    }
  }, []);

  const loadUserWorkouts = (userId: string) => {
    const allWorkouts = localStorage.getItem('vora_saved_workouts');
    if (allWorkouts) {
      const parsed = JSON.parse(allWorkouts) as SavedWorkout[];
      setSavedWorkouts(parsed.filter(w => w.userId === userId));
    }
  };

  const handleLoginSuccess = (email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      role: 'free',
      createdAt: Date.now()
    };
    setUser(newUser);
    localStorage.setItem('vora_user', JSON.stringify(newUser));
    loadUserWorkouts(newUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    setSavedWorkouts([]);
    localStorage.removeItem('vora_user');
    setMode(null);
  };

  const renderContent = () => {
    switch (mode) {
      case 'workout':
        return <WorkoutGenerator user={user} onSave={(sw) => setSavedWorkouts([sw, ...savedWorkouts])} />;
      case 'health':
        return <HealthCheck />;
      case 'history':
        return <SavedHistory workouts={savedWorkouts} onBack={() => setMode(null)} />;
      case 'planner':
        return <WeeklyPlanner user={user} />;
      case 'dictionary':
        return <ExerciseDictionary />;
      default:
        return <ModeSelector onSelectMode={setMode} user={user} onAuthClick={() => setShowAuthModal(true)} />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => setMode(null)} 
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <VoraLogo className="h-7 w-7 text-emerald-500" />
            <span className="font-black text-xl tracking-tighter uppercase">Vora</span>
          </button>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">
                    Active Member
                  </p>
                  <p className="text-xs font-semibold text-neutral-200">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-800 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-grow py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {!mode ? (
            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <Header />
            </div>
          ) : (
            <button 
              onClick={() => setMode(null)} 
              className="group mb-8 inline-flex items-center gap-2.5 text-neutral-500 hover:text-white transition-all duration-300"
            >
              <div className="p-2 border border-neutral-800 rounded-xl group-hover:border-neutral-600 transition-colors">
                <ArrowLeftIcon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold tracking-widest uppercase">Home</span>
            </button>
          )}
          
          <div className="transition-all duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
      
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleLoginSuccess} existingUser={user} />}

      <footer className="relative z-10 py-12 text-center border-t border-neutral-900/50 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6">
          <p className="text-[10px] font-bold text-neutral-600 tracking-widest uppercase">
            Vora Intelligence © 2025
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}