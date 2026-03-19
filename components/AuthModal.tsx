import React, { useState } from 'react';
import { VoraLogo } from './Icons';
import { supabase } from '../supabaseClient'; // IMPORT OUR NEW BRIDGE
import type { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
  existingUser?: User | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, existingUser }) => {
  const [step, setStep] = useState<'login' | 'signup'>(existingUser ? 'login' : 'login');
  const [email, setEmail] = useState(existingUser?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return "Invalid email format";
    
    const domain = email.split('@')[1]?.toLowerCase();
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    if (!allowedDomains.includes(domain)) {
      return "Only standard email providers (Gmail, Yahoo, Outlook, Hotmail, iCloud) are permitted";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (step === 'signup') {
        // --- REAL SIGN UP ---
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        // If Supabase returns a user but email confirmation is ON, notify them
        if (data.user && data.session === null) {
          setError("Check your email for a confirmation link!");
        } else {
          onSuccess(email);
          onClose();
        }
      } else {
        // --- REAL LOGIN ---
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        if (data.user) {
          onSuccess(email);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-[2.5rem] p-10 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <VoraLogo className="h-12 w-12 text-emerald-500 mb-6" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            {step === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-2">
            Access your Vora Pro profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-4">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="name@gmail.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 ml-4">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-neutral-900 rounded-2xl py-4 px-6 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-xs font-bold text-center leading-relaxed">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : step === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center">
          {step === 'login' ? (
            <button 
              onClick={() => { setStep('signup'); setError(''); }}
              className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-emerald-500 transition-colors"
            >
              Don't have an account? Sign Up
            </button>
          ) : (
            <button 
              onClick={() => { setStep('login'); setError(''); }}
              className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-emerald-500 transition-colors"
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
