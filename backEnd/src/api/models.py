"""
Pydantic models for StudyBuddy AI API

These models define the request/response schemas for all API endpoints.
They provide automatic validation, serialization, and API documentation.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from enum import Enum

# Enums for controlled vocabularies
class LearningStyle(str, Enum):
    """Learning style preferences for content adaptation."""
    visual = "visual"
    auditory = "auditory"
    reading = "reading"
    kinesthetic = "kinesthetic"

class DifficultyLevel(str, Enum):
    """Academic difficulty levels for content generation."""
    middle_school = "middle_school"
    high_school = "high_school" 
    college = "college"

class QuestionType(str, Enum):
    """Types of quiz questions supported."""
    multiple_choice = "multiple_choice"
    short_answer = "short_answer"
    true_false = "true_false"

# Request Models
class SummarizeRequest(BaseModel):
    """Request model for text summarization endpoint."""
    
    text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="The educational content to summarize",
        examples=["Photosynthesis is the process by which green plants use sunlight..."]
    )
    
    learning_style: LearningStyle = Field(
        default=LearningStyle.reading,
        description="How to adapt the summary for the student's learning preference"
    )
    
    max_tokens: int = Field(
        default=300,
        ge=50,
        le=1000,
        description="Maximum length of the summary in tokens"
    )
    
    @field_validator('text')
    @classmethod
    def text_must_not_be_empty(cls, v):
        """Ensure text content is meaningful."""
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()

class QuizGenerationRequest(BaseModel):
    """Request model for quiz generation endpoint."""
    
    text: str = Field(
        ...,
        min_length=50,
        max_length=8000,
        description="Source content for quiz questions",
        examples=["The water cycle involves evaporation, condensation, and precipitation..."]
    )
    
    num_questions: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of quiz questions to generate"
    )
    
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.high_school,
        description="Academic level for question complexity"
    )
    
    learning_style: LearningStyle = Field(
        default=LearningStyle.reading,
        description="How to format questions for the student's learning style"
    )
    
    question_types: List[QuestionType] = Field(
        default=[QuestionType.multiple_choice],
        description="Types of questions to include in the quiz"
    )

class TranscriptionRequest(BaseModel):
    """Request model for audio transcription endpoint."""
    
    language: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=5,
        description="Language code for transcription (e.g., 'en', 'es')",
        examples=["en"]
    )
    
    context_prompt: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Context to improve transcription accuracy",
        examples=["This is a biology lecture about cellular respiration"]
    )

# Response Models
class SummarizeResponse(BaseModel):
    """Response model for text summarization."""
    
    summary: str = Field(
        ...,
        description="The generated summary adapted to learning style"
    )
    
    learning_style_used: LearningStyle = Field(
        ...,
        description="The learning style adaptation that was applied"
    )
    
    original_length: int = Field(
        ...,
        description="Character count of original text"
    )
    
    summary_length: int = Field(
        ...,
        description="Character count of generated summary"
    )
    
    processing_time_ms: float = Field(
        ...,
        description="Time taken to generate summary in milliseconds"
    )

class QuizQuestion(BaseModel):
    """Individual quiz question model."""
    
    question: str = Field(
        ...,
        description="The question text"
    )
    
    options: List[str] = Field(
        ...,
        min_length=2,
        max_length=4,
        description="Answer choices for the question"
    )
    
    correct_answer: str = Field(
        ...,
        description="The correct answer (A, B, C, or D for multiple choice)"
    )
    
    explanation: str = Field(
        ...,
        description="Explanation of why the correct answer is right"
    )
    
    difficulty: str = Field(
        ...,
        description="Assessed difficulty level of this question"
    )
    
    question_type: QuestionType = Field(
        ...,
        description="Type of question (multiple choice, short answer, etc.)"
    )

class QuizGenerationResponse(BaseModel):
    """Response model for quiz generation."""
    
    questions: List[QuizQuestion] = Field(
        ...,
        description="Generated quiz questions"
    )
    
    total_questions: int = Field(
        ...,
        description="Number of questions generated"
    )
    
    difficulty_used: DifficultyLevel = Field(
        ...,
        description="Difficulty level applied to questions"
    )
    
    learning_style_used: LearningStyle = Field(
        ...,
        description="Learning style adaptation applied"
    )
    
    estimated_completion_time_minutes: int = Field(
        ...,
        description="Estimated time to complete quiz"
    )
    
    processing_time_ms: float = Field(
        ...,
        description="Time taken to generate quiz"
    )

class TranscriptionResponse(BaseModel):
    """Response model for audio transcription."""
    
    transcription: str = Field(
        ...,
        description="The transcribed text from audio"
    )
    
    language_detected: Optional[str] = Field(
        default=None,
        description="Detected language code if not specified"
    )
    
    confidence_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Confidence score for transcription accuracy"
    )
    
    duration_seconds: Optional[float] = Field(
        default=None,
        description="Audio duration in seconds"
    )
    
    processing_time_ms: float = Field(
        ...,
        description="Time taken to transcribe audio"
    )

# Error Models
class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    error: str = Field(
        ...,
        description="Error type or code"
    )
    
    message: str = Field(
        ...,
        description="Human-readable error description"
    )
    
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional error context"
    )
    
    request_id: Optional[str] = Field(
        default=None,
        description="Unique request identifier for support"
    )

# Analytics Models
class StudySessionRequest(BaseModel):
    """Request model for logging study sessions."""
    
    user_id: str = Field(
        ...,
        description="Unique user identifier"
    )
    
    content_type: str = Field(
        ...,
        description="Type of content studied (textbook, article, notes)"
    )
    
    learning_style: LearningStyle = Field(
        ...,
        description="Learning style used for this session"
    )
    
    duration_minutes: int = Field(
        ...,
        ge=1,
        description="How long the study session lasted"
    )
    
    comprehension_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Self-reported or quiz-measured comprehension (0-100)"
    )

class ProgressResponse(BaseModel):
    """Response model for user progress analytics."""
    
    total_study_time_minutes: int = Field(
        ...,
        description="Total time spent studying"
    )
    
    average_comprehension_score: float = Field(
        ...,
        description="Average comprehension across all sessions"
    )
    
    preferred_learning_style: LearningStyle = Field(
        ...,
        description="Most effective learning style for this user"
    )
    
    improvement_trend: str = Field(
        ...,
        description="Whether performance is improving, stable, or declining"
    )
    
    recommendations: List[str] = Field(
        ...,
        description="Personalized study recommendations"
    )