import React, { useState, useRef, useEffect } from 'react';
import { studyBuddyAPI } from './services/api';
import { 
  BookOpen, 
  Brain, 
  Mic, 
  Upload, 
  Play, 
  Pause, 
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
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [error, setError] = useState(null);

  // Check backend connection on startup
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await studyBuddyAPI.healthCheck();
        setConnectionStatus('connected');
        console.log('Backend connected successfully');
      } catch (error) {
        setConnectionStatus('disconnected');
        console.log('Backend not available, using demo mode');
      }
    };
    checkConnection();
  }, []);

  const learningStyles = [
    { id: 'visual', icon: Eye, label: 'Visual', description: 'Charts, diagrams, bullet points' },
    { id: 'auditory', icon: Headphones, label: 'Auditory', description: 'Conversational, easy to read aloud' },
    { id: 'reading', icon: FileText, label: 'Reading', description: 'Traditional text format' },
    { id: 'kinesthetic', icon: Zap, label: 'Hands-on', description: 'Examples and applications' }
  ];

  const difficultyLevels = [
    { id: 'middle_school', label: 'Middle School', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'high_school', label: 'High School', color: 'bg-blue-100 text-blue-700' },
    { id: 'college', label: 'College', color: 'bg-purple-100 text-purple-700' }
  ];

  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 3,
    difficulty: 'high_school'
  });

  // Real API call for summarization
  const handleSummarize = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (connectionStatus === 'connected') {
        const response = await studyBuddyAPI.summarize(text, learningStyle);
        setSummary(response.summary);
        console.log('Summary generated:', response);
      } else {
        // Fallback demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSummary(`Demo Mode - Here's your personalized ${learningStyle} summary:\n\n${text.slice(0, 200)}...`);
      }
    } catch (error) {
      console.error('Summarization failed:', error);
      setError('Failed to generate summary. Please try again.');
      // Fallback to demo
      setSummary(`Error occurred - Demo: ${learningStyle} summary of your text...`);
    } finally {
      setLoading(false);
    }
  };

  // Real API call for quiz generation
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
        console.log('Quiz generated:', response);
      } else {
        // Fallback demo mode
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
      // Fallback to demo
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

  // Real API call for transcription
  const handleTranscribe = async () => {
    if (!audioFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (connectionStatus === 'connected') {
        const response = await studyBuddyAPI.transcribeAudio(audioFile);
        setTranscription(response.transcription);
        console.log('Transcription completed:', response);
      } else {
        // Fallback demo mode
        await new Promise(resolve => setTimeout(resolve, 2500));
        setTranscription(`Demo Mode - This would be the transcription of ${audioFile.name}. Your backend needs to be running for real transcription.`);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('Failed to transcribe audio. Please try again.');
      // Fallback to demo
      setTranscription(`Error occurred - Demo transcription of ${audioFile.name}`);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25' 
          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-lg hover:shadow-xl border border-gray-100'
      }`}
    >
      <Icon size={22} />
      <span className="text-lg">{label}</span>
    </button>
  );

  const LearningStyleSelector = () => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-3">🎯</span>
        Choose Your Learning Style
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {learningStyles.map((style) => {
          const Icon = style.icon;
          return (
            <button
              key={style.id}
              onClick={() => setLearningStyle(style.id)}
              className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                learningStyle === style.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-blue-300 text-gray-600 bg-white'
              }`}
            >
              <Icon size={32} className={`mx-auto mb-3 ${learningStyle === style.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'}`} />
              <div className="font-bold text-lg mb-2">{style.label}</div>
              <div className="text-sm opacity-80">{style.description}</div>
              {learningStyle === style.id && (
                <div className="mt-3">
                  <CheckCircle className="mx-auto text-blue-600" size={20} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Connection status component
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-lg border">
      {connectionStatus === 'connected' ? (
        <>
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-emerald-600 font-semibold">Connected</span>
        </>
      ) : connectionStatus === 'disconnected' ? (
        <>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-red-600 font-semibold">Demo Mode</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-amber-600 font-semibold">Connecting...</span>
        </>
      )}
    </div>
  );

  // Error display component
  const ErrorDisplay = () => error && (
    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
      <div className="flex items-center space-x-3">
        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        <span className="text-red-700 font-medium">{error}</span>
        <button 
          onClick={() => setError(null)}
          className="ml-auto text-red-500 hover:text-red-700 transition-colors font-bold text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="text-white" size={32} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  StudyBuddy AI
                </h1>
                <p className="text-gray-600 font-medium">Your Personal Study Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <ConnectionStatus />
              <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full border border-amber-200">
                <Star className="text-amber-600" size={20} />
                <span className="text-amber-700 font-bold">Level 3 Learner</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Enhanced Navigation Tabs */}
        <div className="flex flex-wrap gap-6 mb-10 p-4 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200">
          <TabButton
            id="summarize"
            icon={BookOpen}
            label="Smart Summary"
            isActive={activeTab === 'summarize'}
            onClick={setActiveTab}
          />
          <TabButton
            id="quiz"
            icon={Brain}
            label="Quiz Generator"
            isActive={activeTab === 'quiz'}
            onClick={setActiveTab}
          />
          <TabButton
            id="transcribe"
            icon={Mic}
            label="Audio Transcription"
            isActive={activeTab === 'transcribe'}
            onClick={setActiveTab}
          />
        </div>

        {/* Enhanced Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-gray-200">
              <ErrorDisplay />
              
              {activeTab === 'summarize' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">📝 Smart Summary Generator</h2>
                    <p className="text-gray-600 text-lg">Transform your study material into personalized, easy-to-understand summaries.</p>
                  </div>
                  
                  <LearningStyleSelector />
                  
                  <div className="mb-8">
                    <label className="block text-lg font-bold text-gray-700 mb-4">
                      Paste your study material here
                    </label>
                    <div className="relative">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="📚 Paste your notes, articles, textbook chapters, or any educational content here. I'll create a personalized summary that matches your learning style!"
                        className="w-full h-56 p-6 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-700 text-lg leading-relaxed placeholder-gray-400 shadow-inner bg-gray-50/50 transition-all duration-300"
                      />
                      <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg px-3 py-1 text-sm text-gray-500 border shadow-sm">
                        {text.length} / 10,000
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock size={18} />
                        <span className="font-medium">Processing time: ~30 seconds</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSummarize}
                    disabled={!text.trim() || loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-8 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={24} />
                        <span>Creating your personalized summary...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen size={24} />
                        <span>Generate Smart Summary</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {activeTab === 'quiz' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">🧠 Interactive Quiz Generator</h2>
                    <p className="text-gray-600 text-lg">Create personalized quizzes to test and reinforce your learning.</p>
                  </div>
                  
                  <LearningStyleSelector />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-3">
                        🎯 Number of Questions
                      </label>
                      <select
                        value={quizSettings.numQuestions}
                        onChange={(e) => setQuizSettings({...quizSettings, numQuestions: parseInt(e.target.value)})}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium bg-white shadow-sm"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num} question{num !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-3">
                        📈 Difficulty Level
                      </label>
                      <select
                        value={quizSettings.difficulty}
                        onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})}
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium bg-white shadow-sm"
                      >
                        {difficultyLevels.map(level => (
                          <option key={level.id} value={level.id}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-lg font-bold text-gray-700 mb-4">
                      Study Material for Quiz
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="🧠 Paste the content you want to be quizzed on! I'll create engaging questions that match your learning style and difficulty preference."
                      className="w-full h-48 p-6 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-lg leading-relaxed bg-gray-50/50 placeholder-gray-400 shadow-inner transition-all duration-300"
                    />
                  </div>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={!text.trim() || loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-8 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={24} />
                        <span>Generating your personalized quiz...</span>
                      </>
                    ) : (
                      <>
                        <Brain size={24} />
                        <span>Generate Interactive Quiz</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {activeTab === 'transcribe' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">🎤 Audio Transcription</h2>
                    <p className="text-gray-600 text-lg">Convert your lecture recordings and voice notes into searchable text.</p>
                  </div>
                  
                  <div className="mb-8">
                    <div 
                      className="group border-3 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto mb-6 text-gray-400 group-hover:text-blue-500 transition-colors" size={64} />
                      <p className="text-2xl font-bold text-gray-700 mb-3">
                        {audioFile ? audioFile.name : "Upload your audio file"}
                      </p>
                      <p className="text-gray-500 text-lg mb-2">
                        Drop your lectures, voice notes, or study sessions here!
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports MP3, WAV, M4A, and more
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {audioFile && (
                      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                              <Mic className="text-white" size={28} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-xl">{audioFile.name}</p>
                              <p className="text-gray-600 text-lg">{(audioFile.size / 1024 / 1024).toFixed(1)} MB • Ready to transcribe</p>
                            </div>
                          </div>
                          <button
                            onClick={handleTranscribe}
                            disabled={loading}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center space-x-3 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          >
                            {loading ? (
                              <Loader className="animate-spin" size={22} />
                            ) : (
                              <Play size={22} />
                            )}
                            <span>{loading ? "Transcribing..." : "Start Transcription"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 sticky top-28 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="text-blue-600 mr-3" size={28} />
                Results
              </h3>
              
              {!summary && !quiz.length && !transcription && (
                <div className="text-center py-16">
                  <BarChart3 className="mx-auto mb-6 text-gray-300" size={64} />
                  <p className="text-gray-500 text-xl font-semibold mb-2">Your results will appear here!</p>
                  <p className="text-gray-400">Select a tool and start creating</p>
                </div>
              )}

              {summary && activeTab === 'summarize' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-emerald-600">
                    <CheckCircle size={28} />
                    <span className="font-bold text-xl">Summary Ready!</span>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200 shadow-lg">
                    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">{summary}</pre>
                  </div>
                  <button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center justify-center space-x-3 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <Download size={22} />
                    <span>Save Summary</span>
                  </button>
                </div>
              )}

              {quiz.length > 0 && activeTab === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-purple-600">
                    <CheckCircle size={28} />
                    <span className="font-bold text-xl">Quiz Ready!</span>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {quiz.map((question, index) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                        <p className="font-bold text-gray-800 mb-4 text-lg">
                          {index + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-gray-700 bg-white/80 rounded-lg p-3 border border-purple-100 shadow-sm">
                              <span className="font-bold text-purple-600">
                                {String.fromCharCode(65 + optIndex)}.
                              </span> {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    Start Interactive Quiz
                  </button>
                </div>
              )}

              {transcription && activeTab === 'transcribe' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-blue-600">
                    <CheckCircle size={28} />
                    <span className="font-bold text-xl">Transcription Complete!</span>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 max-h-64 overflow-y-auto shadow-lg">
                    <p className="text-gray-700 leading-relaxed text-lg">{transcription}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                      <Download size={20} />
                      <span>Save</span>
                    </button>
                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300">
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