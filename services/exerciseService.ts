const EXERCISE_DB_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export const getExerciseDetails = async (exerciseName: string) => {
  // 1. Better Cleaning: Replace dashes and join words with %20 for the API
  const cleanName = exerciseName
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/classic|effective|simple|intense|weighted|standard/g, '')
    .trim();

  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(cleanName)}?limit=10`;
  
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
    
    // 2. If no exact match, try a broader "Search" instead of "Name"
    if (!Array.isArray(data) || data.length === 0) {
       console.log("No exact match found, trying broader search...");
       const searchUrl = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(cleanName.split(' ')[0])}`;
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
    console.error("ExerciseDB Error:", error);
    return null;
  }
};
