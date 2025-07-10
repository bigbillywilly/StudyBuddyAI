"""
Quiz generation API routes for StudyBuddy AI

Handles adaptive quiz creation with difficulty levels and learning style adaptation.
More complex than summarization due to structured output requirements.
"""

import time
import logging
from fastapi import APIRouter, HTTPException, status
from src.api.models import QuizGenerationRequest, QuizGenerationResponse, QuizQuestion, ErrorResponse
from src.ai.quiz_generator import generate_quiz

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Quiz Generation"])

@router.post(
    "/quiz/generate",
    response_model=QuizGenerationResponse,
    summary="Generate adaptive quiz questions",
    description="""
    Creates quiz questions adapted to academic level and learning style.
    
    **Difficulty Levels:**
    - **middle_school**: Basic comprehension and recall
    - **high_school**: Analysis, inference, critical thinking
    - **college**: Advanced synthesis and evaluation
    
    **Learning Style Adaptations:**
    - **visual**: Questions reference diagrams, charts, visual elements
    - **auditory**: Conversational question style, natural flow
    - **reading**: Traditional academic format, precise language
    - **kinesthetic**: Application scenarios, hands-on examples
    
    **Educational Quality:** Questions test understanding, not just memorization.
    """,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        500: {"model": ErrorResponse, "description": "Quiz generation failed"},
    }
)
async def generate_quiz_questions(request: QuizGenerationRequest):
    """
    Generate adaptive quiz questions from educational content.
    
    This is more complex than summarization because we need structured output
    (multiple questions, each with options, answers, explanations) and we apply
    both difficulty and learning style adaptations.
    """
    
    start_time = time.time()
    
    try:
        logger.info(
            f"Quiz generation request: {len(request.text)} chars, "
            f"{request.num_questions} questions, "
            f"difficulty: {request.difficulty}, "
            f"style: {request.learning_style}"
        )
        
        # Call our AI quiz generation function
        questions = generate_quiz(
            text=request.text,
            num_questions=request.num_questions,
            difficulty=request.difficulty.value,  # Convert enum to string
            learning_style=request.learning_style.value
        )
        
        # Calculate metrics
        processing_time = (time.time() - start_time) * 1000
        
        # Estimate completion time (roughly 1-2 minutes per question)
        estimated_time = request.num_questions * 1.5
        
        logger.info(
            f"Generated {len(questions)} questions in {processing_time:.2f}ms"
        )
        
        # Convert each question dict to a QuizQuestion object
        quiz_questions = []
        for q in questions:
            # Add question_type field if missing (defaulting to multiple_choice)
            if "question_type" not in q:
                q["question_type"] = "multiple_choice"
            quiz_questions.append(QuizQuestion(**q))

        # Return structured response with all the questions
        return QuizGenerationResponse(
            questions=quiz_questions,
            total_questions=len(quiz_questions),
            difficulty_used=request.difficulty,
            learning_style_used=request.learning_style,
            estimated_completion_time_minutes=int(estimated_time),
            processing_time_ms=processing_time
        )
        
    except ValueError as e:
        # Input validation errors
        logger.warning(f"Invalid quiz generation request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    except RuntimeError as e:
        # AI processing errors (JSON parsing, validation, etc.)
        logger.error(f"Quiz generation processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate quiz questions. Please try again."
        )
        
    except Exception as e:
        # Unexpected errors
        logger.error(f"Unexpected quiz generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Quiz generation service temporarily unavailable."
        )