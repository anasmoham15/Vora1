const EXERCISE_DB_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const getExerciseDetails = async (exerciseName: string) => {
  // 🔥 FIX: Clean the name to increase match rate
  // This removes common "AI fluff" words
  const cleanName = exerciseName
    .toLowerCase()
    .replace(/classic|effective|simple|intense|weighted|standard/g, '')
    .trim()
    .split(' ')
    .slice(0, 3) // Take only the first 3 words (e.g., "Barbell Bench Press")
    .join(' ');

  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(cleanName)}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': EXERCISE_DB_KEY || '',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // If the specific name fails, try a broader search
    if (!data || data.length === 0) {
       console.log("No specific match, trying fallback...");
       // You could add a second fetch here with an even simpler name if needed
    }

    if (Array.isArray(data) && data.length > 0) {
      return {
        gifUrl: data[0].gifUrl,
        instructions: data[0].instructions
      };
    }
    return null;
  } catch (error) {
    console.error("ExerciseDB Error:", error);
    return null;
  }
};
