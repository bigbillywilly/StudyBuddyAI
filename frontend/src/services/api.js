import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Making API request:', request.method.toUpperCase(), request.url);
  return request;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const studyBuddyAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Summarization
  summarize: async (text, learningStyle = 'reading', maxTokens = 300) => {
    const response = await api.post('/api/summarize', {
      text,
      learning_style: learningStyle,
      max_tokens: maxTokens
    });
    return response.data;
  },

  // Quiz generation
  generateQuiz: async (text, numQuestions = 3, difficulty = 'high_school', learningStyle = 'reading') => {
    const response = await api.post('/api/quiz/generate', {
      text,
      num_questions: numQuestions,
      difficulty,
      learning_style: learningStyle,
      question_types: ['multiple_choice']
    });
    return response.data;
  },

  // Audio transcription
  transcribeAudio: async (audioFile, language = null, contextPrompt = null) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    
    if (language) {
      formData.append('language', language);
    }
    
    if (contextPrompt) {
      formData.append('context_prompt', contextPrompt);
    }

    const response = await api.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default studyBuddyAPI;