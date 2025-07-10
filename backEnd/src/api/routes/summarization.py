"""
Summarization API routes for StudyBuddy AI

This file handles all text summarization requests with learning style adaptation.
Routes connect the frontend to our AI summarization logic.
"""

import time
import logging
from fastapi import APIRouter, HTTPException, status
from src.api.models import SummarizeRequest, SummarizeResponse, ErrorResponse
from src.ai.summarizer import summarize_text

logger = logging.getLogger(__name__)

# Create router for summarization endpoints
router = APIRouter(prefix="/api", tags=["Summarization"])

@router.post(
    "/summarize",
    response_model=SummarizeResponse,
    summary="Generate personalized summary",
    description="""
    Creates a personalized summary adapted to the student's learning style.
    
    **Learning Styles:**
    - **visual**: Bullet points, clear structure, diagram suggestions
    - **auditory**: Conversational tone, natural speech patterns  
    - **reading**: Traditional academic structure, logical flow
    - **kinesthetic**: Practical examples, real-world applications
    
    **This is StudyBuddy AI's core feature** - personalized learning assistance.
    """,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        500: {"model": ErrorResponse, "description": "AI processing failed"},
    }
)
async def create_summary(request: SummarizeRequest):
    """
    Generate a personalized summary from educational text.
    
    The magic happens here - we take any educational content and adapt it
    to how the student learns best. This is what makes StudyBuddy AI special.
    """
    
    # Track processing time for monitoring
    start_time = time.time()
    
    try:
        logger.info(f"Summarization request: {len(request.text)} chars, style: {request.learning_style}")
        
        # Call our AI summarization function
        summary = summarize_text(
            input_text=request.text,
            learning_style=request.learning_style.value,  # Convert enum to string
            max_tokens=request.max_tokens
        )
        
        # Calculate metrics
        processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # Log successful processing
        logger.info(f"Summary generated in {processing_time:.2f}ms")
        
        # Return structured response
        return SummarizeResponse(
            summary=summary,
            learning_style_used=request.learning_style,
            original_length=len(request.text),
            summary_length=len(summary),
            processing_time_ms=processing_time
        )
        
    except ValueError as e:
        # Input validation errors (empty text, too long, etc.)
        logger.warning(f"Invalid summarization request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    except Exception as e:
        # AI processing errors or other unexpected issues
        logger.error(f"Summarization failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate summary. Please try again."
        )