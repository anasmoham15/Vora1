const EXERCISE_DB_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const getExerciseDetails = async (exerciseName: string) => {
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(exerciseName.toLowerCase())}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': EXERCISE_DB_KEY,
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // ExerciseDB returns an array of matches; we take the first one
    if (data && data.length > 0) {
      return {
        gifUrl: data[0].gifUrl, // The 3D Animation
        instructions: data[0].instructions, // Step-by-step text
        target: data[0].target, // Specific muscle
        equipment: data[0].equipment // Required gear
      };
    }
    return null;
  } catch (error) {
    console.error("ExerciseDB fetch failed:", error);
    return null;
  }
};
