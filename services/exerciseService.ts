const EXERCISE_DB_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const getExerciseDetails = async (exerciseName: string) => {
  // 1. Log the attempt so you can see it in the console
  console.log(`🔍 Searching GIF for: ${exerciseName}`);

  const cleanName = exerciseName
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/classic|effective|simple|intense|weighted|standard|exercise|drills/g, '')
    .trim();

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': EXERCISE_DB_KEY || '',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  try {
    const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(cleanName)}?limit=10`;
    const response = await fetch(url, options);
    
    // Safety check for API Key issues
    if (response.status === 401 || response.status === 403) {
      console.error("❌ RapidAPI Key Error: Check your VITE_RAPIDAPI_KEY");
      return null;
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
       // Fallback: Search ONLY the first word (e.g., "Dumbbell" instead of "Dumbbell Lateral Raise")
       const firstWord = cleanName.split(' ')[0];
       const searchUrl = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(firstWord)}?limit=5`;
       const secondResponse = await fetch(searchUrl, options);
       const secondData = await secondResponse.json();
       
       if (secondData && secondData.length > 0) {
         return {
           gifUrl: secondData[0].gifUrl,
           instructions: secondData[0].instructions
         };
       }
       return null;
    }

    return {
      gifUrl: data[0].gifUrl,
      instructions: data[0].instructions
    };
  } catch (error) {
    console.error("ExerciseDB Network Error:", error);
    return null;
  }
};
