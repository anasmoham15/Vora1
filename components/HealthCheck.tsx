import React, { useState } from 'react';
import { generateHealthAnalysis } from '../services/geminiService';
import type { HealthQuizData } from '../types';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import HealthReport from './HealthReport';
import { ArrowPathIcon } from './Icons';

type QuizQuestion = {
    id: keyof HealthQuizData;
    question: string;
    type: 'radio' | 'number';
    options?: string[];
    placeholder?: string;
    unit?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'activity',
    question: "How often do you exercise?",
    type: 'radio',
    options: ["Rarely", "1-2 days", "3-4 days", "Daily"],
  },
  {
    id: 'sleep',
    question: "How much sleep do you get?",
    type: 'radio',
    options: ["< 5 hours", "5-6 hours", "7-8 hours", "9+ hours"],
  },
  {
    id: 'diet',
    question: "How is your diet?",
    type: 'radio',
    options: ["Mostly Fast Food", "Standard", "Very Healthy"],
  },
  {
    id: 'stress',
    question: "What is your stress level?",
    type: 'radio',
    options: ["Low", "Manageable", "High", "Very High"],
  },
  {
    id: 'intake',
    question: "How often do you have sugar/soda?",
    type: 'radio',
    options: ["Rarely", "Weekly", "Daily", "Frequent"],
  },
  {
    id: 'weight',
    question: "Current Weight",
    type: 'number',
    placeholder: '75',
    unit: 'kg'
  },
  {
    id: 'height',
    question: "Current Height",
    type: 'number',
    placeholder: '180',
    unit: 'cm'
  },
  {
    id: 'bodyFat',
    question: "Body Fat % (If known)",
    type: 'number',
    placeholder: '18',
    unit: '%'
  },
];

const calculateBmi = (weight: string, height: string): number | null => {
    const weightKg = parseFloat(weight);
    const heightCm = parseFloat(height);
    if (isNaN(weightKg) || isNaN(heightCm) || heightCm === 0) {
        return null;
    }
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
};

const calculateHealthScore = (answers: Partial<HealthQuizData>): number => {
    let score = 0;
    if (answers.activity === "1-2 days") score += 10;
    if (answers.activity === "3-4 days") score += 20;
    if (answers.activity === "Daily") score += 25;
    if (answers.sleep === "5-6 hours") score += 10;
    if (answers.sleep === "7-8 hours") score += 25;
    if (answers.sleep === "9+ hours") score += 20;
    if (answers.diet === "Standard") score += 15;
    if (answers.diet === "Very Healthy") score += 25;
    if (answers.stress === "Low") score += 25;
    if (answers.stress === "Manageable") score += 15;
    if (answers.stress === "High") score += 5;
    if (answers.intake === "Daily") score -= 5;
    if (answers.intake === "Frequent") score -= 10;

    return Math.max(0, Math.min(100, score));
};


export default function HealthCheck() {
  const [answers, setAnswers] = useState<Partial<HealthQuizData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const handleAnswerChange = (questionId: keyof HealthQuizData, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const isQuizComplete = QUIZ_QUESTIONS.every(q => {
    if (q.id === 'bodyFat') return true;
    return answers[q.id] && answers[q.id]?.trim() !== '';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQuizComplete) {
        setError("Please answer all questions so we can help you accurately.");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    const fullAnswers = { ...answers, bodyFat: answers.bodyFat || 'Not provided' } as HealthQuizData;

    try {
        const bmi = calculateBmi(fullAnswers.weight, fullAnswers.height);
        const healthScore = calculateHealthScore(fullAnswers);
        const generatedReport = await generateHealthAnalysis(fullAnswers, bmi, healthScore);
        setReport(generatedReport);
    } catch (err) {
        setError("Something went wrong with the analysis. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setAnswers({});
    setReport(null);
    setError(null);
  };

  if (isLoading) return <Loader />;
  if (error && !report) return <ErrorMessage message={error} />;
  
  if (report) {
    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-end mb-6">
                <button 
                  onClick={handleReset} 
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-200 text-[10px] font-bold uppercase tracking-widest"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    New Check
                </button>
            </div>
            <HealthReport report={report} />
        </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto pb-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Health Check-up
        </h2>
        <p className="text-neutral-500 text-sm font-medium">Answer a few questions about your lifestyle to get your wellness report.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {QUIZ_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-neutral-900/40 border border-neutral-800/60 p-6 sm:p-8 rounded-3xl transition-all hover:border-neutral-700/60">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6">
                    {q.question}
                </label>
                
                {q.type === 'radio' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {q.options?.map(option => {
                             const isActive = answers[q.id] === option;
                             return (
                                <label key={option} className={`
                                    cursor-pointer text-center py-4 px-2 rounded-xl text-[10px] font-black transition-all duration-200 border uppercase tracking-widest
                                    ${isActive
                                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10'
                                        : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                                    }
                                `}>
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={option}
                                        checked={isActive}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="sr-only"
                                    />
                                    {option}
                                </label>
                            );
                        })}
                    </div>
                )}
                {q.type === 'number' && (
                    <div className="relative max-w-xs">
                        <input
                            type="number"
                            name={q.id}
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full bg-black/40 text-white rounded-xl py-4 px-5 border border-neutral-800 focus:border-emerald-500 outline-none font-bold text-lg transition-colors placeholder-neutral-800"
                            min="0"
                            step="any"
                        />
                         {q.unit && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-6 text-neutral-600 font-bold text-xs uppercase tracking-widest">
                                {q.unit}
                            </span>
                        )}
                    </div>
                )}
            </div>
        ))}

        <div className="text-center pt-8">
            <button
                type="submit"
                disabled={!isQuizComplete || isLoading}
                className="w-full max-w-sm py-5 rounded-2xl bg-emerald-500 text-black font-black text-lg uppercase tracking-widest transition-all hover:scale-[1.02] shadow-2xl shadow-emerald-500/10 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
            >
                Get My Report
            </button>
        </div>
      </form>
    </section>
  );
}