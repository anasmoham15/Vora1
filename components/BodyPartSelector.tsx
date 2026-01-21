import React from 'react';
import type { BodyPart } from '../types';

interface BodyPartSelectorProps {
  bodyParts: BodyPart[];
  selectedBodyPartId: string | null;
  onSelect: (bodyPartId: string) => void;
}

const BodyPartSelector: React.FC<BodyPartSelectorProps> = ({ bodyParts, selectedBodyPartId, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {bodyParts.map((part) => (
        <button
          key={part.id}
          onClick={() => onSelect(part.id)}
          className={`px-4 py-6 rounded-2xl text-center font-black text-xl transition-all duration-300 border tracking-tighter-custom uppercase
            ${selectedBodyPartId === part.id
              ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl shadow-emerald-500/10'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-200'
            }`}
        >
          {part.name}
        </button>
      ))}
    </div>
  );
};

export default BodyPartSelector;