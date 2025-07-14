import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  Mic, 
  Upload, 
  Play, 
  Download,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  Headphones,
  FileText,
  Zap,
  Star,
  Clock,
  BarChart3
} from 'lucide-react';

const StudyBuddyApp = () => {
  const [activeTab, setActiveTab] = useState('summarize');
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [learningStyle, setLearningStyle] = useState('reading');
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [transcription, setTranscription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const fileInputRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [error, setError] = useState(null);

  // Simulated API calls for demo
  const studyBuddyAPI = React.useMemo(() => ({
    healthCheck: async () => {
      // Simulate health check
      return { status: 'healthy' };
    },
    summarize: async (text, learningStyle) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        summary: `Here's your personalized ${learningStyle} summary:\n\n${text.slice(0, 300)}...\n\nThis summary has been adapted to your ${learningStyle} learning style with key points highlighted and organized for better understanding.`
      };
    },
    generateQuiz: async (text, numQuestions, difficulty, learningStyle) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const questions = [];
      for (let i = 1; i <= numQuestions; i++) {
        questions.push({
          question: `Question ${i}: What is a key concept from the provided text?`,
          options: [`Option A for question ${i}`, `Option B for question ${i}`, `Option C for question ${i}`, `Option D for question ${i}`],
          correct_answer: "A",
          explanation: `This is the correct answer because it directly relates to the main concepts discussed in your study material.`
        });
      }
      return { questions };
    },
    transcribeAudio: async (audioFile) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        transcription: `This is a simulated transcription of your audio file "${audioFile.name}". In a real implementation, this would contain the actual transcribed text from your lecture or voice notes. The transcription would capture all spoken content and convert it to searchable, readable text.`
      };
    }
  }), []);

  // Check backend connection on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await studyBuddyAPI.healthCheck();
        setConnectionStatus('connected');
        console.log('✅ Demo mode - simulated backend connection');
      } catch (error) {
        setConnectionStatus('disconnected');
        console.log('❌ Using demo mode');
      }
    };
    checkConnection();
  }, [studyBuddyAPI]);

  const learningStyles = [
    { id: 'visual', icon: Eye, label: 'Visual', description: 'Charts, diagrams, bullet points' },
    { id: 'auditory', icon: Headphones, label: 'Auditory', description: 'Conversational, easy to read aloud' },
    { id: 'reading', icon: FileText, label: 'Reading', description: 'Traditional text format' },
    { id: 'kinesthetic', icon: Zap, label: 'Hands-on', description: 'Examples and applications' }
  ];

  const difficultyLevels = [
    { id: 'middle_school', label: 'Middle School' },
    { id: 'high_school', label: 'High School' },
    { id: 'college', label: 'College' }
  ];

  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 3,
    difficulty: 'high_school'
  });

  // API call for summarization
  const handleSummarize = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await studyBuddyAPI.summarize(text, learningStyle);
      setSummary(response.summary);
      console.log('✅ Summary generated:', response);
    } catch (error) {
      console.error('Summarization failed:', error);
      setError('Failed to generate summary. Please try again.');
      setSummary(`Error occurred - Demo: ${learningStyle} summary of your text...`);
    } finally {
      setLoading(false);
    }
  };

  // API call for quiz generation
  const handleGenerateQuiz = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (connectionStatus === 'connected') {
        const response = await studyBuddyAPI.generateQuiz(
          text, 
          quizSettings.numQuestions, 
          quizSettings.difficulty, 
          learningStyle
        );
        setQuiz(response.questions);
        console.log('✅ Quiz generated:', response);
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setQuiz([
          {
            question: "Demo Question: What is the main topic?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correct_answer: "A",
            explanation: "Demo explanation..."
          }
        ]);
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      setError('Failed to generate quiz. Please try again.');
      setQuiz([{
        question: "Error occurred - Demo question about your text",
        options: ["Demo A", "Demo B", "Demo C", "Demo D"],
        correct_answer: "A",
        explanation: "Demo explanation"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  // API call for transcription
  const handleTranscribe = async () => {
    if (!audioFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (connectionStatus === 'connected') {
        const response = await studyBuddyAPI.transcribeAudio(audioFile);
        setTranscription(response.transcription);
        console.log('✅ Transcription completed:', response);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2500));
        setTranscription(`Demo Mode - This would be the transcription of ${audioFile.name}. Your backend needs to be running for real transcription.`);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('Failed to transcribe audio. Please try again.');
      setTranscription(`Error occurred - Demo transcription of ${audioFile.name}`);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const LearningStyleSelector = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Learning Style</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {learningStyles.map((style) => {
          const Icon = style.icon;
          return (
            <button
              key={style.id}
              onClick={() => setLearningStyle(style.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                learningStyle === style.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 text-gray-600 bg-white'
              }`}
            >
              <Icon size={24} className="mx-auto mb-2" />
              <div className="font-medium">{style.label}</div>
              <div className="text-xs mt-1 opacity-75">{style.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2 text-sm">
      {connectionStatus === 'connected' ? (
        <>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-600 font-medium">Connected</span>
        </>
      ) : connectionStatus === 'disconnected' ? (
        <>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-red-600 font-medium">Demo Mode</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-600 font-medium">Connecting...</span>
        </>
      )}
    </div>
  );

  const ErrorDisplay = () => error && (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2 text-red-700">
        <AlertCircle size={16} />
        <span className="text-sm">{error}</span>
        <button 
          onClick={() => setError(null)}
          className="ml-auto text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">StudyBuddy AI</h1>
                <p className="text-gray-600">Your Personal Study Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <Star className="text-yellow-500" size={16} />
                <span className="font-medium">Level 3 Learner</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex gap-4 mb-8 p-3 bg-gray-100 rounded-lg">
          <TabButton
            id="summarize"
            icon={BookOpen}
            label="Summarize"
            isActive={activeTab === 'summarize'}
            onClick={setActiveTab}
          />
          <TabButton
            id="quiz"
            icon={Brain}
            label="Quiz Me"
            isActive={activeTab === 'quiz'}
            onClick={setActiveTab}
          />
          <TabButton
            id="transcribe"
            icon={Mic}
            label="Transcribe"
            isActive={activeTab === 'transcribe'}
            onClick={setActiveTab}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ErrorDisplay />
              
              {activeTab === 'summarize' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Smart Summary Generator</h2>
                  <LearningStyleSelector />
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Paste your study material here
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your notes, articles, textbook chapters, or any educational content here. I'll create a personalized summary that matches your learning style!"
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <span>{text.length} / 10,000 characters</span>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>~30 seconds</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSummarize}
                    disabled={!text.trim() || loading}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Creating your summary...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />
                        <span>Generate Smart Summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Generator</h2>
                  <LearningStyleSelector />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                      </label>
                      <select
                        value={quizSettings.numQuestions}
                        onChange={(e) => setQuizSettings({...quizSettings, numQuestions: parseInt(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num} question{num !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={quizSettings.difficulty}
                        onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {difficultyLevels.map(level => (
                          <option key={level.id} value={level.id}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Material for Quiz
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste the content you want to be quizzed on! I'll create engaging questions that match your learning style."
                      className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={!text.trim() || loading}
                    className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Generating quiz...</span>
                      </>
                    ) : (
                      <>
                        <Brain size={20} />
                        <span>Generate Quiz</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeTab === 'transcribe' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Audio Transcription</h2>
                  
                  <div className="mb-6">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {audioFile ? audioFile.name : "Upload your audio file"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Drop your lectures, voice notes, or study sessions here!
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {audioFile && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Mic className="text-white" size={24} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{audioFile.name}</p>
                            <p className="text-sm text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleTranscribe}
                          disabled={loading}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 font-semibold transition-colors"
                        >
                          {loading ? (
                            <Loader className="animate-spin" size={18} />
                          ) : (
                            <Play size={18} />
                          )}
                          <span>{loading ? "Transcribing..." : "Start Transcription"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="text-blue-600 mr-2" size={24} />
                Results
              </h3>
              
              {!summary && !quiz.length && !transcription && (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500 font-medium">Your results will appear here!</p>
                  <p className="text-gray-400 text-sm mt-1">Select a tool and start creating</p>
                </div>
              )}

              {summary && activeTab === 'summarize' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Summary Ready!</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{summary}</pre>
                  </div>
                  <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2 font-medium transition-colors">
                    <Download size={16} />
                    <span>Save Summary</span>
                  </button>
                </div>
              )}

              {quiz.length > 0 && activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Quiz Ready!</span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {quiz.map((question, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="font-medium text-gray-800 mb-3">
                          {index + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-sm text-gray-600 bg-white rounded p-2">
                              <span className="font-medium text-purple-600">
                                {String.fromCharCode(65 + optIndex)}.
                              </span> {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium transition-colors">
                    Start Quiz
                  </button>
                </div>
              )}

              {transcription && activeTab === 'transcribe' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Transcription Complete!</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-700">{transcription}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-1 font-medium transition-colors">
                      <Download size={16} />
                      <span>Save</span>
                    </button>
                    <button className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                      Summarize
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddyApp;