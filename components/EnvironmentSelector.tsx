import React from 'react';
import type { Environment } from '../types';
import { HomeIcon, DumbbellIcon, BuildingLibraryIcon } from './Icons';

interface EnvironmentSelectorProps {
  environments: Environment[];
  selectedEnvironmentId: string | null;
  onSelect: (environmentId: string) => void;
}

const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  home: HomeIcon,
  home_dumbbells: DumbbellIcon,
  gym: BuildingLibraryIcon,
};


const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({ environments, selectedEnvironmentId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {environments.map((env) => {
        const Icon = ICONS[env.id];
        const isSelected = selectedEnvironmentId === env.id;
        
        return (
          <button
            key={env.id}
            onClick={() => onSelect(env.id)}
            className={`p-8 rounded-3xl text-left transition-all duration-200 border group
              ${isSelected
                ? 'bg-white border-white'
                : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-600'
              }`}
          >
            <div className={`mb-8 transition-transform group-hover:scale-110 ${isSelected ? 'text-black' : 'text-green-500'}`}>
                <Icon className="h-8 w-8" />
            </div>
            
            <div className={`font-bold text-xl mb-1 ${isSelected ? 'text-black' : 'text-white'}`}>
                {env.name}
            </div>
            <div className={`text-xs uppercase tracking-widest font-semibold ${isSelected ? 'text-neutral-600' : 'text-neutral-500'}`}>
                {env.description}
            </div>
          </button>
        )
      })}
    </div>
  );
};

export default EnvironmentSelector;