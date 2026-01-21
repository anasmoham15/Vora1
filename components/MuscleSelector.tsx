import React from 'react';
import type { Muscle } from '../types';

interface MuscleSelectorProps {
  muscles: Muscle[];
  selectedMuscleId: string | null;
  onSelect: (muscleId: string) => void;
}

const MuscleSelector: React.FC<MuscleSelectorProps> = ({ muscles, selectedMuscleId, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {muscles.map((muscle) => (
        <button
          key={muscle.id}
          onClick={() => onSelect(muscle.id)}
          className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 border
            ${selectedMuscleId === muscle.id
              ? 'bg-green-500 text-black border-green-500'
              : 'bg-black border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-200'
            }`}
        >
          {muscle.name}
        </button>
      ))}
    </div>
  );
};

export default MuscleSelector;