
import type { BodyPart, Environment } from './types';

export const BODY_PARTS: BodyPart[] = [
  {
    name: 'Chest',
    id: 'chest',
    muscles: [
      { name: 'Pectoralis Major (Overall Chest)', id: 'pectoralis_major' },
      { name: 'Upper Chest (Clavicular Head)', id: 'upper_chest' },
      { name: 'Lower Chest (Sternal Head)', id: 'lower_chest' },
    ],
  },
  {
    name: 'Back',
    id: 'back',
    muscles: [
      { name: 'Latissimus Dorsi (Lats)', id: 'lats' },
      { name: 'Trapezius (Traps)', id: 'traps' },
      { name: 'Rhomboids', id: 'rhomboids' },
      { name: 'Erector Spinae (Lower Back)', id: 'lower_back' },
    ],
  },
  {
    name: 'Legs',
    id: 'legs',
    muscles: [
      { name: 'Quadriceps (Quads)', id: 'quads' },
      { name: 'Hamstrings', id: 'hamstrings' },
      { name: 'Gluteus Maximus (Glutes)', id: 'glutes' },
      { name: 'Calves', id: 'calves' },
    ],
  },
  {
    name: 'Shoulders',
    id: 'shoulders',
    muscles: [
      { name: 'Anterior Deltoid (Front Delt)', id: 'front_delt' },
      { name: 'Lateral Deltoid (Side Delt)', id: 'side_delt' },
      { name: 'Posterior Deltoid (Rear Delt)', id: 'rear_delt' },
    ],
  },
  {
    name: 'Arms',
    id: 'arms',
    muscles: [
      { name: 'Biceps', id: 'biceps' },
      { name: 'Triceps', id: 'triceps' },
      { name: 'Forearms', id: 'forearms' },
    ],
  },
    {
    name: 'Core',
    id: 'core',
    muscles: [
      { name: 'Rectus Abdominis (Abs)', id: 'abs' },
      { name: 'Obliques', id: 'obliques' },
      { name: 'Transverse Abdominis', id: 'transverse_abdominis' },
    ],
  },
];

export const WORKOUT_ENVIRONMENTS: Environment[] = [
  {
    name: 'Home',
    id: 'home',
    description: 'Bodyweight only',
  },
  {
    name: 'Home (Dumbbells)',
    id: 'home_dumbbells',
    description: 'Dumbbells required',
  },
  {
    name: 'Gym',
    id: 'gym',
    description: 'Full equipment access',
  },
];
