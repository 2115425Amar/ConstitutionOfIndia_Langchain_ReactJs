import axios from 'axios';

const API_URL = 'https://api.jsonserve.com/Uw5CrX';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const fetchQuizData = async () => {
  try {
    console.log('Fetching quiz data from:', API_URL);
    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(API_URL)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.data) {
      throw new Error('No data received from API');
    }

    console.log('Raw API response:', response.data);
    
    // Transform the API response to match our quiz structure
    const transformedData = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description || response.data.topic,
      duration: response.data.duration,
      negative_marks: parseFloat(response.data.negative_marks),
      correct_marks: parseFloat(response.data.correct_answer_marks),
      questions: response.data.questions.map(question => ({
        id: question.id,
        description: question.description,
        topic: question.topic,
        options: question.options.map(option => ({
          id: option.id,
          description: option.description,
          isCorrect: option.is_correct,
          questionId: option.question_id,
          unanswered: option.unanswered
        }))
      }))
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching quiz data:', error.response || error);
    throw error;
  }
};

// Mock data for development and fallback
const getMockQuizData = () => {
  return {
    id: 60,
    title: "Genetics and Evolution",
    description: "Test your knowledge of genetics and evolution",
    duration: 15,
    questions: [
      {
        id: 1,
        description: "What is the basic unit of heredity?",
        options: [
          { id: 1, description: "Gene" },
          { id: 2, description: "Chromosome" },
          { id: 3, description: "DNA" },
          { id: 4, description: "RNA" }
        ],
        correctAnswer: "Gene"
      },
      {
        id: 2,
        description: "Who is known as the father of genetics?",
        options: [
          { id: 5, description: "Charles Darwin" },
          { id: 6, description: "Gregor Mendel" },
          { id: 7, description: "Watson and Crick" },
          { id: 8, description: "Aristotle" }
        ],
        correctAnswer: "Gregor Mendel"
      },
      {
        id: 3,
        description: "What is the process by which DNA makes a copy of itself?",
        options: [
          { id: 9, description: "Transcription" },
          { id: 10, description: "Translation" },
          { id: 11, description: "Replication" },
          { id: 12, description: "Mutation" }
        ],
        correctAnswer: "Replication"
      },
      {
        id: 4,
        description: "Which of these is NOT a base found in DNA?",
        options: [
          { id: 13, description: "Adenine" },
          { id: 14, description: "Uracil" },
          { id: 15, description: "Guanine" },
          { id: 16, description: "Cytosine" }
        ],
        correctAnswer: "Uracil"
      },
      {
        id: 5,
        description: "What is natural selection?",
        options: [
          { id: 17, description: "Survival of the fittest" },
          { id: 18, description: "Random genetic drift" },
          { id: 19, description: "Artificial breeding" },
          { id: 20, description: "Genetic engineering" }
        ],
        correctAnswer: "Survival of the fittest"
      }
    ]
  };
}; 