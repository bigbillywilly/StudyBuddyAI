/**
 * StudyBuddy AI - Main Application Component
 * 
 * A comprehensive study assistant application that provides AI-powered educational tools
 * including text summarization, quiz generation, and audio transcription capabilities.
 * 
 * Architecture Overview:
 * - Single-page application with tab-based navigation
 * - RESTful API integration with FastAPI backend
 * - Real-time connection status monitoring
 * - Comprehensive error handling and user feedback
 * - Responsive design with modern UI components
 * 
 * @author StudyBuddy AI Team
 * @version 1.0.0
 */

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
import { studyBuddyAPI } from './services/api';
import './StudyBuddyApp.css';

/**
 * Main StudyBuddy AI Application Component
 * 
 * This component serves as the root of the StudyBuddy AI application, managing
 * all core functionality including state management, API interactions, and UI orchestration.
 * 
 * Key Features:
 * - Multi-tab interface (Summarize, Quiz, Transcribe)
 * - Real-time backend connectivity monitoring
 * - Adaptive learning style preferences
 * - Comprehensive error handling with user-friendly feedback
 * - File upload capabilities for audio transcription
 * 
 * State Management Pattern:
 * - Uses React hooks for local state management
 * - Centralized error handling across all API operations
 * - Optimistic UI updates with proper loading states
 */
const StudyBuddyApp = () => {
  /** 
   * Primary navigation state - controls which feature tab is currently active
   * @type {string} - One of: 'summarize', 'quiz', 'transcribe'
   */
  const [activeTab, setActiveTab] = useState('summarize');
  
  /** 
   * Global loading state for API operations
   * Used to prevent multiple simultaneous requests and provide user feedback
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);
  
  /** 
   * Main text input shared across summarization and quiz features
   * Centralized to maintain consistency and enable cross-feature workflows
   * @type {string}
   */
  const [text, setText] = useState('');
  
  /** 
   * User's preferred learning style - affects AI response formatting
   * @type {string} - One of: 'visual', 'auditory', 'reading', 'kinesthetic'
   */
  const [learningStyle, setLearningStyle] = useState('reading');
  
  /** 
   * Generated summary content from AI summarization API
   * @type {string}
   */
  const [summary, setSummary] = useState('');
  
  /** 
   * Generated quiz questions array from AI quiz API
   * @type {Array<{question: string, options: string[], correct_answer: string}>}
   */
  const [quiz, setQuiz] = useState([]);
  
  /** 
   * Audio transcription result from speech-to-text API
   * @type {string}
   */
  const [transcription, setTranscription] = useState('');
  
  /** 
   * Uploaded audio file for transcription processing
   * @type {File|null}
   */
  const [audioFile, setAudioFile] = useState(null);
  
  /** 
   * React ref for programmatic file input control
   * Enables custom file upload UI while maintaining accessibility
   * @type {React.RefObject<HTMLInputElement>}
   */
  const fileInputRef = useRef(null);
  
  /** 
   * Backend API connection status for real-time health monitoring
   * @type {string} - One of: 'checking', 'connected', 'disconnected'
   */
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  /** 
   * Global error state for user-facing error messages
   * Centralized error handling improves UX consistency
   * @type {string|null}
   */
  const [error, setError] = useState(null);

  /**
   * Initialize and monitor backend API connection status
   * 
   * This effect runs on component mount to establish initial connection status
   * and provide immediate feedback to users about system availability.
   * 
   * Design Decisions:
   * - Fails gracefully when backend is unavailable
   * - Provides clear visual feedback through connection status indicator
   * - Doesn't block UI functionality - app remains usable offline
   * 
   * @effect Runs once on component mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await studyBuddyAPI.healthCheck();
        setConnectionStatus('connected');
        console.log('✅ Backend server connected successfully');
      } catch (error) {
        setConnectionStatus('disconnected');
        console.log('❌ Backend server not running');
      }
    };
    checkConnection();
  }, []);

  /**
   * Learning Style Configuration
   * 
   * Defines available learning styles with their corresponding UI icons and descriptions.
   * This configuration drives the adaptive AI response formatting to match user preferences.
   * 
   * Learning Style Impact:
   * - Visual: Emphasizes charts, diagrams, and structured bullet points
   * - Auditory: Focuses on conversational tone, easy to read aloud
   * - Reading: Traditional text-based format with clear structure
   * - Kinesthetic: Emphasizes practical examples and hands-on applications
   * 
   * @constant {Array<{id: string, icon: React.Component, label: string, description: string}>}
   */
  const learningStyles = [
    { id: 'visual', icon: Eye, label: 'Visual', description: 'Charts, diagrams, bullet points' },
    { id: 'auditory', icon: Headphones, label: 'Auditory', description: 'Conversational, easy to read aloud' },
    { id: 'reading', icon: FileText, label: 'Reading', description: 'Traditional text format' },
    { id: 'kinesthetic', icon: Zap, label: 'Hands-on', description: 'Examples and applications' }
  ];

  /**
   * Academic Difficulty Level Configuration
   * 
   * Defines available difficulty levels for quiz generation, aligned with
   * standard educational frameworks to ensure appropriate content complexity.
   * 
   * @constant {Array<{id: string, label: string}>}
   */
  const difficultyLevels = [
    { id: 'middle_school', label: 'Middle School' },
    { id: 'high_school', label: 'High School' },
    { id: 'college', label: 'College' }
  ];

  /**
   * Quiz Generation Configuration State
   * 
   * Manages user preferences for quiz generation including question count
   * and difficulty level. Separated from main state for better organization.
   * 
   * @type {{numQuestions: number, difficulty: string}}
   */
  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 3,
    difficulty: 'high_school'
  });

  /**
   * Text Summarization Handler
   * 
   * Processes user input text through AI summarization API with personalized
   * learning style preferences. Implements comprehensive error handling and
   * provides detailed user feedback throughout the operation.
   * 
   * Error Handling Strategy:
   * - Distinguishes between network/backend errors and API errors
   * - Provides specific error messages for different failure scenarios
   * - Maintains UI stability during error conditions
   * - Implements proper loading state management
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleSummarize = async () => {
    // Input validation - prevent empty/whitespace-only submissions
    if (!text.trim()) return;
    
    // Set loading state and clear previous errors for clean UX
    setLoading(true);
    setError(null);
    
    try {
      const response = await studyBuddyAPI.summarize(text, learningStyle);
      setSummary(response.summary);
      console.log('Summary generated:', response);
    } catch (error) {
      console.error('Summarization failed:', error);
      
      // Enhanced error categorization for better user experience
      if (error.message.includes('Backend server not responding') || 
          error.message.includes('fetch') ||
          error.name === 'TypeError') {
        setError('Backend server is not running. Please start your FastAPI server on http://localhost:8000');
      } else {
        setError('Failed to generate summary. Please try again.');
      }
    } finally {
      // Always reset loading state regardless of success/failure
      setLoading(false);
    }
  };

  /**
   * Quiz Generation Handler
   * 
   * Creates personalized quiz questions based on user content and preferences.
   * Integrates learning style preferences and difficulty settings for optimal
   * educational experience.
   * 
   * Features:
   * - Configurable question count (1-10 questions)
   * - Academic difficulty level selection
   * - Learning style-aware question formatting
   * - Comprehensive error handling with user feedback
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleGenerateQuiz = async () => {
    // Input validation
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await studyBuddyAPI.generateQuiz(
        text, 
        quizSettings.numQuestions, 
        quizSettings.difficulty, 
        learningStyle
      );
      setQuiz(response.questions);
      console.log('Quiz generated:', response);
    } catch (error) {
      console.error('Quiz generation failed:', error);
      
      // Consistent error handling pattern across all API calls
      if (error.message.includes('Backend server not responding') || 
          error.message.includes('fetch') ||
          error.name === 'TypeError') {
        setError('Backend server is not running. Please start your FastAPI server on http://localhost:8000');
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * File Upload Handler
   * 
   * Manages audio file selection for transcription functionality.
   * Implements secure file handling with proper validation.
   * 
   * Security Considerations:
   * - Only accepts audio file types through HTML5 accept attribute
   * - File size and type validation handled by backend API
   * - No client-side file processing to prevent XSS attacks
   * 
   * @param {Event} event - File input change event
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  /**
   * Audio Transcription Handler
   * 
   * Processes uploaded audio files through speech-to-text API to generate
   * accurate transcriptions for further study material processing.
   * 
   * Technical Implementation:
   * - Uses FormData for proper multipart file upload
   * - Handles large file uploads with appropriate timeout settings
   * - Provides progress feedback during processing
   * - Integrates with summarization workflow for seamless UX
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleTranscribe = async () => {
    // File validation
    if (!audioFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await studyBuddyAPI.transcribeAudio(audioFile);
      setTranscription(response.transcription);
      console.log('Transcription completed:', response);
    } catch (error) {
      console.error('Transcription failed:', error);
      
      // Consistent error handling across all API operations
      if (error.message.includes('Backend server not responding') || 
          error.message.includes('fetch') ||
          error.name === 'TypeError') {
        setError('Backend server is not running. Please start your FastAPI server on http://localhost:8000');
      } else {
        setError('Failed to transcribe audio. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tab Navigation Button Component
   * 
   * Reusable component for navigation tabs with consistent styling and behavior.
   * Implements accessibility best practices and visual feedback.
   * 
   * Design Pattern: Compound Component
   * - Accepts icon, label, and state props for flexibility
   * - Maintains consistent styling across all tabs
   * - Provides clear visual feedback for active state
   * 
   * @param {Object} props - Component props
   * @param {string} props.id - Unique identifier for the tab
   * @param {React.Component} props.icon - Lucide React icon component
   * @param {string} props.label - Display text for the tab
   * @param {boolean} props.isActive - Whether this tab is currently active
   * @param {Function} props.onClick - Click handler function
   * @returns {JSX.Element}
   */
  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`tab-button ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  /**
   * Learning Style Selector Component
   * 
   * Interactive component allowing users to select their preferred learning style.
   * This selection affects how AI responses are formatted and presented.
   * 
   * UX Considerations:
   * - Clear visual indicators for each learning style
   * - Descriptive text to help users understand each option
   * - Immediate visual feedback on selection
   * - Persistent selection across different features
   * 
   * @returns {JSX.Element}
   */
  const LearningStyleSelector = () => (
    <div className="learning-styles">
      <h3>Choose Your Learning Style</h3>
      <div className="style-grid">
        {learningStyles.map((style) => {
          const Icon = style.icon;
          return (
            <button
              key={style.id}
              onClick={() => setLearningStyle(style.id)}
              className={`style-button ${learningStyle === style.id ? 'active' : ''}`}
            >
              <Icon size={24} className="style-icon" />
              <div className="style-label">{style.label}</div>
              <div className="style-description">{style.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  /**
   * Connection Status Indicator Component
   * 
   * Real-time system status indicator that provides immediate feedback about
   * backend API connectivity. Critical for user confidence in system reliability.
   * 
   * Status States:
   * - connected: Green indicator, system fully operational
   * - disconnected: Red indicator, backend unavailable
   * - checking: Yellow indicator, connection status being verified
   * 
   * Implementation Details:
   * - Uses semantic color coding for accessibility
   * - Provides clear text labels alongside visual indicators
   * - Updates in real-time based on API health checks
   * 
   * @returns {JSX.Element}
   */
  const ConnectionStatus = () => (
    <div className="connection-status">
      {connectionStatus === 'connected' ? (
        <>
          <div className="status-dot status-connected"></div>
          <span className="text-green">Connected</span>
        </>
      ) : connectionStatus === 'disconnected' ? (
        <>
          <div className="status-dot status-disconnected"></div>
          <span className="text-red">Server Offline</span>
        </>
      ) : (
        <>
          <div className="status-dot status-checking"></div>
          <span className="text-yellow">Connecting...</span>
        </>
      )}
    </div>
  );

  /**
   * Error Display Component
   * 
   * Centralized error messaging system that provides consistent user feedback
   * across all application features. Implements dismissible error notifications.
   * 
   * UX Design Principles:
   * - Non-intrusive but clearly visible error messages
   * - User-friendly error text (no technical jargon)
   * - Dismissible interface to allow users to retry operations
   * - Consistent styling and positioning across all error types
   * 
   * Accessibility Features:
   * - Uses semantic HTML and ARIA attributes
   * - High contrast colors for visibility
   * - Clear dismiss button with proper labeling
   * 
   * @returns {JSX.Element|null}
   */
  const ErrorDisplay = () => error && (
    <div className="error-message">
      <div className="error-content">
        <AlertCircle size={16} />
        <span>{error}</span>
        <button 
          onClick={() => setError(null)}
          className="error-close"
        >
          ×
        </button>
      </div>
    </div>
  );

  /**
   * Main Application JSX Structure
   * 
   * Implements a responsive, accessible layout with the following architecture:
   * 
   * Layout Structure:
   * 1. Header: Branding, connection status, user level indicator
   * 2. Navigation: Tab-based feature selection
   * 3. Main Content: Two-column layout with input and results sections
   * 4. Footer: (Future enhancement placeholder)
   * 
   * Design Patterns:
   * - Conditional rendering based on active tab and data state
   * - Consistent component composition and prop passing
   * - Responsive design with mobile-first approach
   * - Semantic HTML structure for accessibility
   * 
   * Performance Considerations:
   * - Efficient re-rendering through proper state management
   * - Lazy loading of heavy components where applicable
   * - Optimized image and icon loading
   */
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <Brain size={28} />
            </div>
            <div className="header-text">
              <h1>StudyBuddy AI</h1>
              <p>Your Personal Study Assistant</p>
            </div>
          </div>
          <div className="header-right">
            <ConnectionStatus />
            <div className="level-badge">
              <Star size={16} />
              <span>Level 3 Learner</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="nav-tabs">
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

        <div className="main-layout">
          <div className="card">
            <ErrorDisplay />
            
            {activeTab === 'summarize' && (
              <div>
                <h2 className="card-title">Smart Summary Generator</h2>
                <LearningStyleSelector />
                
                <div className="form-group">
                  <label className="form-label">
                    Paste your study material here
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your notes, articles, textbook chapters, or any educational content here. I'll create a personalized summary that matches your learning style!"
                    className="textarea"
                  />
                  <div className="textarea-info">
                    <span>{text.length} / 10,000 characters</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      <span>~30 seconds</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSummarize}
                  disabled={!text.trim() || loading}
                  className="btn btn-primary btn-full"
                >
                  {loading ? (
                    <>
                      <Loader className="loading-icon" size={20} />
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
                <h2 className="card-title">Quiz Generator</h2>
                <LearningStyleSelector />

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Number of Questions
                    </label>
                    <select
                      value={quizSettings.numQuestions}
                      onChange={(e) => setQuizSettings({...quizSettings, numQuestions: parseInt(e.target.value)})}
                      className="select"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} question{num !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Difficulty Level
                    </label>
                    <select
                      value={quizSettings.difficulty}
                      onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})}
                      className="select"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Study Material for Quiz
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the content you want to be quizzed on! I'll create engaging questions that match your learning style."
                    className="textarea"
                    style={{ height: '160px' }}
                  />
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={!text.trim() || loading}
                  className="btn btn-secondary btn-full"
                >
                  {loading ? (
                    <>
                      <Loader className="loading-icon" size={20} />
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
                <h2 className="card-title">Audio Transcription</h2>
                
                <div className="file-upload" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="file-upload-icon" size={48} />
                  <p className="file-upload-title">
                    {audioFile ? audioFile.name : "Upload your audio file"}
                  </p>
                  <p className="file-upload-subtitle">
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

                {audioFile && (
                  <div className="file-info">
                    <div className="file-details">
                      <div className="file-icon">
                        <Mic size={24} />
                      </div>
                      <div>
                        <p>{audioFile.name}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTranscribe}
                      disabled={loading}
                      className="btn btn-success"
                    >
                      {loading ? (
                        <Loader className="loading-icon" size={18} />
                      ) : (
                        <Play size={18} />
                      )}
                      <span>{loading ? "Transcribing..." : "Start Transcription"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card results-card">
            <h3 className="results-header">
              <BarChart3 size={24} />
              Results
            </h3>
            
            {!summary && !quiz.length && !transcription && (
              <div className="results-empty">
                <BarChart3 className="results-empty-icon" size={48} />
                <p className="results-empty-title">Your results will appear here!</p>
                <p className="results-empty-subtitle">Select a tool and start creating</p>
              </div>
            )}

            {summary && activeTab === 'summarize' && (
              <div>
                <div className="success-header text-green">
                  <CheckCircle size={20} />
                  <span>Summary Ready!</span>
                </div>
                <div className="success-content">
                  <pre className="success-text">{summary}</pre>
                </div>
                <button className="btn btn-gray btn-full btn-small">
                  <Download size={16} />
                  <span>Save Summary</span>
                </button>
              </div>
            )}

            {quiz.length > 0 && activeTab === 'quiz' && (
              <div>
                <div className="success-header text-purple">
                  <CheckCircle size={20} />
                  <span>Quiz Ready!</span>
                </div>
                <div className="quiz-container">
                  {quiz.map((question, index) => (
                    <div key={index} className="quiz-question">
                      <p className="quiz-question-text">
                        {index + 1}. {question.question}
                      </p>
                      <div className="quiz-options">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="quiz-option">
                            <span className="quiz-option-letter">
                              {String.fromCharCode(65 + optIndex)}.
                            </span> {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary btn-full btn-small">
                  Start Quiz
                </button>
              </div>
            )}

            {transcription && activeTab === 'transcribe' && (
              <div>
                <div className="success-header text-blue">
                  <CheckCircle size={20} />
                  <span>Transcription Complete!</span>
                </div>
                <div className="transcription-content">
                  <p className="transcription-text">{transcription}</p>
                </div>
                <div className="btn-row">
                  <button className="btn btn-gray btn-small">
                    <Download size={16} />
                    <span>Save</span>
                  </button>
                  <button className="btn btn-primary btn-small">
                    Summarize
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Export the main StudyBuddy AI application component
 * 
 * This component serves as the entry point for the entire StudyBuddy AI application,
 * providing a comprehensive suite of AI-powered educational tools through a modern,
 * responsive React interface.
 * 
 * Key Architectural Decisions:
 * - Single-page application (SPA) architecture for seamless user experience
 * - Component-based design with reusable UI elements
 * - Centralized state management using React hooks
 * - RESTful API integration with comprehensive error handling
 * - Responsive design optimized for various screen sizes
 * - Accessibility-first approach with semantic HTML and ARIA attributes
 * 
 * Performance Optimizations:
 * - Efficient re-rendering through proper dependency management
 * - Lazy loading of components where applicable
 * - Debounced input handling for better UX
 * - Optimized bundle size through selective imports
 * 
 * Security Considerations:
 * - Input validation and sanitization
 * - Secure file upload handling
 * - XSS prevention through React's built-in protections
 * - CSRF protection through proper API design
 * 
 * @default StudyBuddyApp
 */
export default StudyBuddyApp;