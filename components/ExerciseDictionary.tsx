import React, { useState, useMemo, useRef, useEffect } from 'react';
import { searchExerciseDetail } from '../services/geminiService';
import type { ExerciseDetail } from '../types';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

// Expanded list to 500+ exercises across all muscle groups
const ALL_EXERCISE_SUGGESTIONS = [
  // Chest
  "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Fly", "Cable Crossover", "Push Up", "Dips", "Pec Deck Machine", "Hammer Strength Press", "Floor Press", "Close Grip Bench Press", "Spoto Press", "Weighted Push Up", "Diamond Push Up", "Archer Push Up", "Svendsen Press", "Landmine Press", "Incline Dumbbell Fly", "Single Arm Cable Fly", "Machine Chest Press", "Decline Dumbbell Press", "Clap Push Up", "Plyometric Push Up",
  // Back
  "Deadlift", "Barbell Row", "Pull Up", "Lat Pulldown", "Bent Over Row", "T-Bar Row", "Seated Cable Row", "Face Pull", "Chin Up", "Single Arm Dumbbell Row", "Meadows Row", "Rack Pull", "Straight Arm Pulldown", "Reverse Fly", "Hyperextension", "Good Morning", "Pendlay Row", "Yates Row", "Kroc Row", "Seal Row", "Inverted Row", "Pullover", "Lat Pulldown (Neutral Grip)", "Lat Pulldown (Wide Grip)", "Lat Pulldown (Underhand)", "Single Arm Lat Pulldown", "Muscle Up", "Back Extension", "Superman",
  // Shoulders
  "Overhead Press", "Military Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Arnold Press", "Upright Row", "Push Press", "Dumbbell Shoulder Press", "Machine Shoulder Press", "Cable Lateral Raise", "Face Pull", "Egyptian Lateral Raise", "Lu Raise", "Reverse Pec Deck", "Bent Over Lateral Raise", "Clean and Press", "Thrusters", "Handstand Push Up", "Pike Push Up", "Z Press", "Snatch Grip High Pull", "Bradford Press", "Scarecrow",
  // Legs (Quads, Hams, Glutes)
  "Barbell Squat", "Front Squat", "Leg Press", "Leg Extension", "Leg Curl", "Lunge", "Bulgarian Split Squat", "Hack Squat", "Goblet Squat", "Stiff Leg Deadlift", "Romanian Deadlift", "Glute Bridge", "Hip Thrust", "Calf Raise", "Seated Calf Raise", "Donkey Calf Raise", "Sumo Deadlift", "Box Squat", "Zercher Squat", "Walking Lunge", "Reverse Lunge", "Step Up", "Pistol Squat", "Wall Sit", "Curtsy Lunge", "Glute Ham Raise", "Nordic Hamstring Curl", "Good Morning", "Single Leg Romanian Deadlift", "Sissy Squat", "Adductor Machine", "Abductor Machine", "Box Jump", "Goblet Lunge", "Overhead Squat", "Split Squat", "Frog Pump",
  // Arms (Biceps, Triceps, Forearms)
  "Dumbbell Curl", "Barbell Curl", "Hammer Curl", "Preacher Curl", "Concentration Curl", "Spider Curl", "Zottman Curl", "Tricep Pushdown", "Skullcrusher", "Tricep Extension", "Overhead Tricep Extension", "Close Grip Bench Press", "Dips", "Rope Pushdown", "Reverse Grip Pushdown", "JM Press", "Cable Curl", "Incline Dumbbell Curl", "21s", "Waiters Curl", "Reverse Curl", "Wrist Curl", "Reverse Wrist Curl", "Farmers Walk", "Plate Pinch", "Fat Gripz Training", "Towel Pull Up", "Single Arm Tricep Extension", "Kickbacks", "Bench Dips",
  // Core
  "Plank", "Side Plank", "Crunch", "Leg Raise", "Hanging Leg Raise", "Russian Twist", "Bicycle Crunch", "V-Up", "Dead Bug", "Bird Dog", "Woodchopper", "Ab Wheel Rollout", "Cable Crunch", "Mountain Climber", "Reverse Crunch", "Heel Touch", "Flutter Kicks", "Hollow Body Hold", "Dragon Flag", "L-Sit", "Sit Up", "Captain's Chair", "Toe to Bar", "Windshield Wipers", "Pallof Press", "Turkish Get-Up", "Weighted Plank", "Bear Crawl", "Renegade Row",
  // Explosive / Functional / Full Body
  "Clean", "Power Clean", "Snatch", "Power Snatch", "Jerk", "Burpee", "Kettlebell Swing", "Snatch Grip High Pull", "Wall Ball", "Battle Ropes", "Sled Push", "Sled Pull", "Medicine Ball Slam", "Man Maker", "Box Jump", "Broad Jump", "Sprinting", "Tire Flip", "Farmers Carry", "Sandbag Carry", "Turkish Get-Up", "Bear Crawl", "Jump Squat", "Plyometric Pushup",
  // Variations & Specialized
  "Deficit Deadlift", "Pause Squat", "Tempo Bench Press", "Pin Press", "Floor Press", "Spoto Press", "Kloko Press", "Snatch Balance", "Overhead Squat", "Sots Press", "Grip Training", "Neck Training", "Tibialis Raise", "Poliquin Step Up", "Peterson Step Up", "Spanish Squat", "Landmine Rotation", "Cossack Squat", "Jefferson Deadlift", "Suitcase Deadlift", "Single Leg Hip Thrust", "B-Stance RDL", "B-Stance Hip Thrust", "Kas Glute Bridge", "Cable Glute Kickback", "Hyperextension (45 degree)", "Hyperextension (90 degree)", "Reverse Hyperextension", "Cable Pull Through", "Seated Good Morning", "Floating Deadlift", "Snatch Grip Deadlift", "Reeves Deadlift", "Hack Squat (Barbell)", "Sissy Squat (Bodyweight)", "Sissy Squat (Weighted)", "Nordic Curl (Regressed)", "Swiss Ball Crunch", "Medicine Ball Russian Twist", "Ab Wheel (Kneeling)", "Ab Wheel (Standing)", "Turkish Get Up (Half)", "Kettlebell Goblet Squat", "Kettlebell Clean", "Kettlebell Snatch", "Kettlebell Windmill", "Kettlebell Halo", "Dumbbell Devil Press", "Cluster", "Echo Bike Sprint", "Rower Sprint", "SkiErg Power Pull", "Assault Bike Intervals", "Stairmaster Intervals", "Hill Sprints", "Prowler Push", "Yoke Walk", "Log Press", "Axle Bar Clean and Press", "Circus Dumbbell Press", "Atlas Stone Lift", "Sandbag Load", "Viking Press", "Car Deadlift (Simulated)", "Conan's Walk", "Duck Walk", "Power Stairs", "Frame Carry", "Fingal's Fingers",
  "Incline Hammer Strength Press", "High Row", "Low Row", "Cable Pullover", "Dumbbell Pullover", "Behind the Neck Press", "Cuban Press", "Face Pull with External Rotation", "Cable External Rotation", "Cable Internal Rotation", "Dumbbell External Rotation", "Wall Slide", "Scapular Pull Up", "Scapular Push Up", "Push Up to Side Plank", "Spiderman Push Up", "Decline Push Up", "Incline Push Up", "Stability Ball Push Up", "Ring Push Up", "TRX Push Up", "TRX Row", "TRX Atomic Push Up", "TRX Fallout", "TRX Hamstring Curl", "TRX Pistol Squat", "TRX Y-Fly", "TRX T-Fly", "Yoga Push Up", "Downward Dog", "Cobra Stretch", "Cat-Cow", "Thoracic Rotation", "Worlds Greatest Stretch", "90/90 Hip Switch", "Pigeon Stretch", "Couch Stretch", "Hamstring Flossing", "Ankle Mobility Circles", "Wrist Mobility Extensions", "Deep Squat Hold", "Bear Sit", "Shin Box", "Glute Bridge March", "Single Leg Glute Bridge", "Frog Stretch", "Adductor Rock Back", "Scapular Dip", "Straight Arm Dip", "V-Bar Pushdown", "Single Arm Rope Pushdown", "Behind Head Cable Extension", "Dumbbell JM Press", "Z-Press (Dumbbell)", "Silly Walk (Mobility)", "Monster Walk", "Sumo Walk", "Band Pull Apart", "Band Dislocates", "Band Face Pull", "Band Overhead Press", "Band Squat", "Band Row", "Band Chest Fly", "Band Bicep Curl", "Band Tricep Extension", "Glute Loop Squat", "Glute Loop Clamshell", "Glute Loop Glute Bridge", "Glute Loop Lateral Walk", "Abductor Pulse", "Seated Leg Curl (Machine)", "Lying Leg Curl (Machine)", "Standing Leg Curl (Machine)", "Leg Extension (Pause)", "Leg Extension (Drop Set)", "Hack Squat (Pause)", "Leg Press (High Foot)", "Leg Press (Low Foot)", "Leg Press (Wide Foot)", "Leg Press (Narrow Foot)", "Calf Press on Leg Press", "Single Leg Calf Raise", "Toe Raise", "Tibialis Bar Raise", "Nordic Hamstring Drop", "Sliding Leg Curl", "Stability Ball Leg Curl", "Dumbbell Leg Curl", "GHD Sit Up", "GHD Back Extension", "GHD Hip Extension", "Sorenson Hold", "Deadlift (Pause at Knee)", "Deadlift (Block Pull)", "Deadlift (Deficit)", "Deadlift (Tempo)", "Barbell Row (Strict)", "Barbell Row (Cheating)", "Underhand Barbell Row", "Pendlay Row (Strict)", "One Arm T-Bar Row", "Meadows Row (Dumbbell)", "One Arm Landmine Row", "Seal Row (Dumbbell)", "Seal Row (Barbell)", "Incline Dumbbell Row", "Chest Supported Row", "Kroc Row (High Rep)", "One Arm Lat Pulldown (Kneeling)", "Lat Pulldown (V-Bar)", "Lat Pulldown (D-Handle)", "Behind the Neck Lat Pulldown", "Assisted Pull Up", "Assisted Dip", "Band Assisted Pull Up", "Weighted Pull Up", "Weighted Dip", "Muscle Up (Ring)", "Muscle Up (Bar)", "False Grip Training", "L-Hang", "German Hang", "Skin the Cat", "Front Lever", "Back Lever", "Planche Lean", "Hollow Body Crunch", "Side Crunch", "Oblique Crunch", "Toe Touch", "Windmill (Dumbbell)", "Windmill (Bodyweight)", "Bent Press", "Two Hands Anyhow", "Turkish Get Up (Kettlebell)", "Turkish Get Up (Dumbbell)", "Turkish Get Up (Sandbag)", "Sandbag Clean", "Sandbag Squat", "Sandbag Shoulder Carry", "Sandbag Reverse Lunge", "Sandbag Floor Press", "Sandbag Row", "Sandbag Slam", "Med Ball Rotation", "Med Ball Chest Pass", "Med Ball Overhead Throw", "Med Ball Side Throw", "Burpee (Standard)", "Burpee Over Bar", "Burpee Box Jump Over", "Devil Press", "Dumbbell Snatch", "Dumbbell Clean", "Dumbbell Power Clean", "Dumbbell Split Jerk", "Dumbbell Push Jerk", "Dumbbell Strict Press", "Barbell Strict Press", "Barbell Push Press", "Barbell Push Jerk", "Barbell Split Jerk", "Thruster (Barbell)", "Thruster (Dumbbell)", "Thruster (Kettlebell)", "Double Kettlebell Clean", "Double Kettlebell Snatch", "Double Kettlebell Jerk", "Double Kettlebell Front Squat", "Double Kettlebell Press", "Single Arm Kettlebell Press", "Single Arm Kettlebell Jerk", "Single Arm Kettlebell Snatch", "Suitcase Carry", "Zercher Carry", "Waiter Carry", "Overhead Carry", "Mixed Carry", "Bottoms Up Kettlebell Press", "Bottoms Up Kettlebell Walk", "Wrist Roller", "Hand Gripper Training", "Finger Curls", "Reverse Wrist Curls (Cable)", "Hammer Curls (Cable)", "Preacher Curls (Cable)", "Spider Curls (Dumbbell)", "Concentration Curls (Cable)", "Drag Curls", "Cheat Curls", "Strict Curls", "Bayesian Curls", "Overhead Cable Curls", "Hercules Curls", "Cross Body Hammer Curls", "Incline Curls (Pause)", "Incline Curls (Tempo)", "Dumbbell Floor Press", "Barbell Floor Press", "Close Grip Floor Press", "Reverse Grip Bench Press", "Guillotine Press", "Wide Grip Bench Press", "Larsen Press", "Board Press", "Slingshot Bench Press", "Paused Bench Press", "Tempo Squat", "Paused Squat", "Pin Squat", "Anderson Squat", "Box Squat (High)", "Box Squat (Low)", "Safety Bar Squat", "Cambered Bar Squat", "Bow Bar Squat", "Duffalo Bar Squat", "Earthquake Bar Bench", "Bamboo Bar Press", "Chain Squat", "Chain Bench Press", "Band Squat (Accommodating)", "Band Bench (Accommodating)", "Reverse Band Squat", "Reverse Band Deadlift", "Deadlift with Chains", "Rack Pull (Above Knee)", "Rack Pull (Below Knee)", "Snatch Grip Deadlift from Deficit", "Stiff Leg Deadlift from Deficit", "Romanian Deadlift (Dumbbell)", "Romanian Deadlift (Kettlebell)", "Romanian Deadlift (Single Leg)", "Good Mornings (Seated)", "Good Mornings (Safety Bar)", "Back Extension (Weighted)", "Glute Ham Raise (Weighted)", "Reverse Hyper (Weighted)", "Frog Pumps (Weighted)", "Single Leg Hip Thrust (Weighted)", "B-Stance Hip Thrust (Weighted)", "Walking Lunges (Dumbbell)", "Walking Lunges (Barbell)", "Walking Lunges (Sandbag)", "Step Ups (Dumbbell)", "Step Ups (Barbell)", "Step Ups (High Box)", "Split Squat (Dumbbell)", "Split Squat (Barbell)", "Split Squat (Rear Foot Elevated)", "Split Squat (Front Foot Elevated)", "Sissy Squats (Hack Machine)", "Leg Press (Single Leg)", "Leg Extension (Single Leg)", "Leg Curl (Single Leg)", "Adductor Machine (Tempo)", "Abductor Machine (Tempo)", "Hip Circle Walk", "Clamshells (Band)", "Donkey Kicks (Cable)", "Glute Kickbacks (Machine)", "Side Lying Leg Raise", "Copenhagen Plank", "Copenhagen Plank (Short Lever)", "Copenhagen Plank (Long Lever)", "Copenhagen Plank (Dynamic)", "Nordic Curls (Assisted)", "Hamstring Slide", "Single Leg Sliding Curl", "Stability Ball Hamstring Curl (Single Leg)", "Glute Bridge (Band)", "Hip Thrust (Pause)", "Hip Thrust (Constant Tension)", "Calf Raises (Smith Machine)", "Calf Raises (Leg Press Machine)", "Calf Raises (Single Leg)", "Tibialis Raise (Weighted)", "Tibialis Bar (Single Leg)", "Ankle Inversion (Band)", "Ankle Eversion (Band)", "Plank (Weighted)", "Side Plank (Weighted)", "Side Plank (Leg Raise)", "Plank (Shoulder Tap)", "Plank (Jack)", "Bird Dog (Weighted)", "Dead Bug (Weighted)", "Russian Twist (Medicine Ball)", "V-Ups (Weighted)", "Cable Crunches (Strict)", "Ab Wheel (Full Range)", "Mountain Climbers (Fast)", "Mountain Climbers (Cross Body)", "Reverse Crunches (Bench)", "Hollow Body Rock", "Hollow Body Pulse", "Dragon Flag (Negative)", "Dragon Flag (Full)", "L-Sit (Parallel Bars)", "L-Sit (Floor)", "L-Sit (Rings)", "Sit Ups (Weighted)", "Captain's Chair (Leg Raise)", "Captain's Chair (Knee Raise)", "Toe to Bar (Strict)", "Toe to Bar (Kipping)", "Windshield Wipers (Floor)", "Windshield Wipers (Hanging)", "Pallof Press (Iso-Hold)", "Pallof Press (Dynamic)", "Pallof Press (Overhead)", "Turkish Get Up (Bottoms Up)", "Renegade Row (Dumbbell)", "Renegade Row (Kettlebell)", "Bear Crawl (Forward)", "Bear Crawl (Backward)", "Bear Crawl (Lateral)", "Crab Walk", "Duck Walk (Weighted)", "Cossack Squat (Dumbbell)", "Cossack Squat (Kettlebell)", "Jefferson Squat", "Jefferson Deadlift (Barbell)", "Suitcase Deadlift (Dumbbell)", "Suitcase Deadlift (Barbell)", "Single Leg Romanian Deadlift (Landmine)", "Landmine Press (Standing)", "Landmine Press (Half Kneeling)", "Landmine Squat", "Landmine Row (One Arm)", "Landmine Meadows Row", "Landmine Rotation (Anti-Rotation)", "Landmine Rotation (Power)", "Landmine Lateral Raise", "Landmine Rear Delt Fly", "Landmine Chest Press", "Single Leg Leg Press", "Single Leg Hack Squat", "Dumbbell Split Squat", "Goblet Split Squat", "Barbell Split Squat", "Box Jump Over", "Broad Jump Over", "Vertical Jump", "Depth Jump", "Power Skip", "Box Step Up (Weighted)", "Farmer's Walk (Trap Bar)", "Farmer's Walk (Dumbbell)", "Farmer's Walk (Kettlebell)", "Sandbag Carry (Bear Hug)", "Sandbag Carry (Overhead)", "Sandbag Carry (Shoulder)", "Tire Flip (Heavy)", "Battle Ropes (Waves)", "Battle Ropes (Slams)", "Battle Ropes (Circles)", "Sled Push (High Handle)", "Sled Push (Low Handle)", "Sled Pull (Rope)", "Sled Pull (Harness)", "Med Ball Slam (Weighted)", "Med Ball Throw (Underhand)", "Man Makers", "Devil Press (Dumbbell)", "Dumbbell Clusters", "Echo Bike (All Out)", "Rower (Long Distance)", "Rower (Sprint)", "Concept2 Row", "Concept2 Ski", "Air Bike Sprint", "Stairmaster Power Climb", "Assault Bike Recovery", "Hill Sprints (Steep)", "Log Clean and Press", "Axle Bar Deadlift", "Atlas Stone Load", "Conan's Wheel", "Frame Carry (Weighted)", "Yoke Walk (Heavy)", "Viking Press (Strict)", "Circus Dumbbell (Heavy)", "Fingal's Fingers (Simulated)", "Stair Climber", "Treadmill Walk (Incline)", "Treadmill Run", "Elliptical", "Swimming", "Jump Rope", "Double Unders", "Shadow Boxing", "Heavy Bag Training", "Speed Bag Training", "Slip Bag Training", "Focus Mitts", "Bicep Curl (Cable)", "Tricep Extension (Cable)", "Face Pull (Cable)", "Cable Kickback", "Cable Hip Abduction", "Cable Hip Adduction", "Cable Standing Chest Press", "Cable Low to High Fly", "Cable High to Low Fly", "Cable Woodchopper (High to Low)", "Cable Woodchopper (Low to High)", "Cable Oblique Twist", "Hammer Strength Row", "Hammer Strength Lat Pulldown", "Hammer Strength Shoulder Press", "Hammer Strength Incline Press", "Hammer Strength Decline Press", "Smith Machine Squat", "Smith Machine Bench Press", "Smith Machine Incline Press", "Smith Machine Overhead Press", "Smith Machine Shrug", "Smith Machine Calf Raise", "Smith Machine Lunges", "Smith Machine Romanian Deadlift", "Shrugs (Barbell)", "Shrugs (Dumbbell)", "Shrugs (Smith Machine)", "Shrugs (Cable)", "Hanging Scapular Pulls", "Chest Supported Rear Delt Fly", "Face Pulls (Band)", "L-Flies", "Y-W-T-L Raises", "Wall Slides (Scapular)", "Prone Cobra", "Bird Dog (Alternating)", "Dead Bug (Alternating)", "Plank (Knee to Elbow)", "Side Plank (Dip)", "Crunch (Stability Ball)", "Reverse Crunch (Decline Bench)", "Leg Raise (Flat Bench)", "Vertical Leg Raise", "Toe to Bar (Parallel Bars)", "Flutter Kicks (Weighted)", "Hollow Body Hold (Weighted)", "Plank (Saw)", "Plank (Reach)", "Body Saw (Sliders)", "Mountain Climbers (Sliders)", "Ab Rollout (Stability Ball)", "Ab Rollout (Barbell)", "Cable Lift", "Cable Chop", "Rotational Med Ball Throw", "Med Ball Slams (Side)", "Weighted Russian Twist", "Weighted Decline Sit Up", "Crunch (Weighted)", "Jackknife (Stability Ball)", "Pike (Stability Ball)", "Knee Tuck (Stability Ball)", "Hyperextension (Weighted)", "Good Morning (Band)", "Romanian Deadlift (Band)", "Stiff Leg Deadlift (Band)", "Deadlift (Band Over Bar)", "Squat (Band Around Knees)", "Hip Abduction (Band)", "Hip Adduction (Band)", "Lateral Walk (Band)", "Monster Walk (Band)", "Clamshells (Band)", "Glute Bridge March (Band)", "Hamstring Curl (Band)", "Leg Extension (Band)", "Bicep Curl (Band)", "Tricep Extension (Band)", "Chest Press (Band)", "Lat Pulldown (Band)", "Seated Row (Band)", "Upright Row (Band)", "Lateral Raise (Band)", "Front Raise (Band)", "Face Pull (Band)", "Shrug (Band)", "Wrist Curl (Band)", "Wrist Extension (Band)", "Hammer Curl (Band)", "Arnold Press (Band)", "Overhead Press (Band)", "Push Up (Band)", "Dip (Band Assisted)", "Pull Up (Band Assisted)", "Lunge (Band)", "Split Squat (Band)", "Squat (Band Over Shoulders)", "Good Morning (Safety Bar)", "Hatfield Squat", "Split Squat (Safety Bar)", "Calf Raise (Safety Bar)", "Barbell Shrug (Behind Back)", "Trap Bar Shrug", "Dumbbell Shrug (Seated)", "Kelso Shrug", "Scapular Row", "Scapular Lat Pulldown", "Wide Grip Pull Up", "Narrow Grip Pull Up", "Neutral Grip Pull Up", "Weighted Chin Up", "Underhand Grip Chin Up", "Kipping Pull Up", "Butterfly Pull Up", "Strict Muscle Up", "Kipping Muscle Up", "Ring Dip", "Ring Row", "Ring Fly", "Ring Fallout", "Ring Layout", "Ring Rollout", "Ring Support Hold", "Support Hold (Parallel Bars)", "Dip (Straight Bar)", "Australian Pull Up", "Scapular Dip (Weighted)", "Handstand Walk", "Handstand Hold", "Free Standing Handstand", "Strict Handstand Push Up", "Kipping Handstand Push Up", "L-Sit Pull Up", "L-Sit Chin Up", "L-Sit Dip", "Iron Cross (Training)", "Back Lever (Tuck)", "Front Lever (Tuck)", "Planche (Tuck)", "Maltese (Training)", "Planche Push Up", "Pike Push Up (Elevated Feet)", "Pseudo Planche Push Up", "One Arm Push Up", "One Arm Pull Up (Training)", "One Arm Chin Up (Training)", "Archer Pull Up", "Archer Push Up", "Archer Squat", "Cossack Squat (Weighted)", "Duck Walk (Bodyweight)", "Lizard Crawl", "Dragon Walk", "Shrimp Squat", "Hawaiian Squat", "Sissy Squat (Strict)", "Natural Leg Extension", "Nordic Hamstring Curl (Weighted)", "Reverse Nordic Curl", "Peterson Step Up (Bodyweight)", "Poliquin Step Up (Weighted)", "Step Up (High Box - Weighted)", "Reverse Lunge (Deficit)", "Forward Lunge (Deficit)", "Walking Lunge (Deficit)", "Rear Foot Elevated Split Squat (Deficit)", "Zercher Squat (Pause)", "Zercher Deadlift", "Jefferson Squat (Weighted)", "Hack Squat (Machine - Weighted)", "Leg Press (Machine - Weighted)", "Calf Raise (Machine - Weighted)", "Seated Calf Raise (Machine - Weighted)", "Donkey Calf Raise (Weighted)", "Tibialis Raise (Single Leg - Weighted)", "Ankle Circle (Weighted)", "Wrist Roller (Weighted)", "Fat Gripz Bench Press", "Fat Gripz Row", "Fat Gripz Curl", "Fat Gripz Deadlift", "Grip Strength Training", "Hand Extension (Band)", "Hand Extension (Rice Bucket)", "Finger Training", "Forearm Smash", "Muscle Smash", "Foam Rolling", "Lacrosse Ball Release", "Stretching (Active)", "Stretching (Static)", "Stretching (Dynamic)", "PNF Stretching", "Mobility Drills", "Flow Training"
];

const COMMON_EXERCISES = [
  "Barbell Squat", "Bench Press", "Deadlift", "Overhead Press", 
  "Pull Up", "Barbell Row", "Dumbbell Curl", "Tricep Pushdown",
  "Lateral Raise", "Leg Press", "Lat Pulldown", "Plank",
  "Push Up", "Lunges", "Face Pull", "Hamstring Curl"
];

// Simple Levenshtein distance for "Did you mean?"
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const ExerciseDictionary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    
    // Sort by relevance (starts with first, then contains)
    return ALL_EXERCISE_SUGGESTIONS
      .filter(ex => ex.toLowerCase().includes(query) && ex.toLowerCase() !== query)
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aStarts = aLower.startsWith(query);
        const bStarts = bLower.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aLower.length - bLower.length;
      })
      .slice(0, 10);
  }, [searchQuery]);

  const filteredCommon = useMemo(() => {
    if (!searchQuery) return COMMON_EXERCISES;
    const query = searchQuery.toLowerCase();
    return COMMON_EXERCISES.filter(ex => ex.toLowerCase().includes(query));
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    const finalQuery = query.trim();
    if (!finalQuery) return;

    setSearchQuery(finalQuery);
    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);
    setDidYouMean(null);

    try {
      // Check for misspellings if the query doesn't look like a standard exercise
      const exactMatch = ALL_EXERCISE_SUGGESTIONS.find(ex => ex.toLowerCase() === finalQuery.toLowerCase());
      
      if (!exactMatch && finalQuery.length > 3) {
        // Look for close matches
        const closest = ALL_EXERCISE_SUGGESTIONS.reduce((best, current) => {
          const dist = getLevenshteinDistance(finalQuery.toLowerCase(), current.toLowerCase());
          if (dist < best.dist) return { dist, term: current };
          return best;
        }, { dist: 100, term: '' });

        if (closest.dist > 0 && closest.dist <= 3) {
          setDidYouMean(closest.term);
        }
      }

      const detail = await searchExerciseDetail(finalQuery);
      setSelectedExercise(detail);
    } catch (err) {
      setError("Exercise not found. Try a different name.");
      // Even if API fails, we might have a suggestion
      if (!didYouMean) {
         const closest = ALL_EXERCISE_SUGGESTIONS.reduce((best, current) => {
          const dist = getLevenshteinDistance(finalQuery.toLowerCase(), current.toLowerCase());
          if (dist < best.dist) return { dist, term: current };
          return best;
        }, { dist: 100, term: '' });
        if (closest.dist <= 4) setDidYouMean(closest.term);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <section className="space-y-12 animate-in fade-in duration-500 pb-24 px-1">
      <div className="p-6 md:p-8 bg-neutral-900/20 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        
        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest-custom mb-3">Exercise Dictionary</h3>
        <p className="text-xl md:text-2xl font-bold text-neutral-100 tracking-tighter-custom mb-10">
          Learn the mechanics of any movement.
        </p>

        <div className="relative" ref={suggestionRef}>
          <form onSubmit={handleFormSubmit} className="relative group">
            <input 
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search e.g. 'Back Squat'..."
              className="w-full bg-black/60 border border-neutral-800 rounded-2xl py-4 md:py-5 px-6 md:px-8 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700 text-base md:text-lg font-medium"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 md:p-3 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </form>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-[60] w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[min(300px,60vh)] overflow-y-auto custom-scrollbar">
              {filteredSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-8 py-4 text-[10px] md:text-xs font-bold text-neutral-400 hover:bg-neutral-900 hover:text-emerald-500 transition-colors border-b border-neutral-900/50 last:border-0 uppercase tracking-widest flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500"></span>
                    {suggestion}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {didYouMean && (
          <div className="mt-4 animate-in fade-in slide-in-from-left-2 duration-300">
             <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
               Did you mean? <button onClick={() => handleSearch(didYouMean)} className="text-emerald-500 hover:text-emerald-400 underline underline-offset-4 decoration-emerald-500/30 transition-colors ml-1">{didYouMean}</button>
             </p>
          </div>
        )}

        {error && !didYouMean && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-6 text-center">{error}</p>}
      </div>

      {selectedExercise ? (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
          {/* Subtle accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/40"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-10 pb-8 border-b border-neutral-800">
            <div className="max-w-full overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                <span className="px-2 md:px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 whitespace-nowrap">
                  {selectedExercise.type}
                </span>
                <span className="px-2 md:px-3 py-1 bg-neutral-800 text-neutral-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg border border-neutral-700 whitespace-nowrap">
                  {selectedExercise.muscleGroup}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter-custom leading-tight break-words">
                {selectedExercise.name}
              </h2>
            </div>
            <button 
              onClick={() => setSelectedExercise(null)}
              className="text-neutral-500 hover:text-white transition-colors p-2 md:p-0 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest-custom">Technique Guide</h4>
               <p className="text-neutral-300 text-base md:text-lg leading-relaxed font-medium">
                  {selectedExercise.description}
               </p>
            </div>
            <div className="bg-black/40 rounded-3xl p-6 md:p-8 border border-neutral-800 flex items-center justify-center text-center relative group">
               <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
               <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <p className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Focus on slow tempo and maximum muscle contraction.
                  </p>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCommon.map(ex => (
            <button
              key={ex}
              onClick={() => handleSearch(ex)}
              className="p-5 md:p-6 bg-neutral-900/30 border border-neutral-800 rounded-2xl text-left hover:border-emerald-500/40 hover:bg-neutral-900/50 transition-all group overflow-hidden relative"
            >
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest block mb-2 group-hover:text-emerald-500 transition-colors">Featured</span>
              <h4 className="text-white font-black text-sm md:text-base uppercase tracking-tighter-custom leading-tight truncate relative">{ex}</h4>
            </button>
          ))}
          {filteredCommon.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-600 font-bold uppercase tracking-widest text-[10px]">
               No local matches found. Use the search bar for AI lookup.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ExerciseDictionary;