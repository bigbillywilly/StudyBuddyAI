"""
Audio transcription API routes for StudyBuddy AI

Handles file upload and speech-to-text conversion for students who learn
better through audio content like lecture recordings.
"""

import time
import logging
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from src.api.models import TranscriptionRequest, TranscriptionResponse, ErrorResponse
from src.ai.transcriber import transcribe_audio, SUPPORTED_FORMATS, MAX_FILE_SIZE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Transcription"])

@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    summary="Transcribe audio to text",
    description="""
    Convert audio files to text using OpenAI's Whisper model.
    
    **Supported formats:** MP3, MP4, MPEG, MPGA, M4A, WAV, WebM
    **File size limit:** 25MB
    **Languages:** Auto-detected or specify language code
    
    Perfect for:
    - Lecture recordings
    - Study group discussions  
    - Voice notes and explanations
    - Accessibility support
    """,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file or parameters"},
        413: {"model": ErrorResponse, "description": "File too large"},
        500: {"model": ErrorResponse, "description": "Transcription failed"},
    }
)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    language: Optional[str] = None,
    context_prompt: Optional[str] = None
):
    """
    Transcribe uploaded audio file to text.

    This endpoint handles the full workflow:
    1. Validate file format and size
    2. Save temporarily for processing
    3. Call Whisper API for transcription
    4. Clean up temporary files
    5. Return formatted response
    """
    
    start_time = time.time()
    temp_file_path = None
    
    try:
        # Validate file format
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided in uploaded file"
            )
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format: {file_extension}. "
                       f"Supported: {', '.join(sorted(SUPPORTED_FORMATS))}"
            )
        
        # Read file content and validate size
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_FILE_SIZE:
            size_mb = file_size / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large: {size_mb:.1f}MB. Maximum: {MAX_FILE_SIZE / (1024 * 1024)}MB"
            )
        
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file uploaded"
            )
        
        logger.info(f"Processing audio file: {file.filename} ({file_size} bytes)")
        
        # Save file temporarily for Whisper API
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        # Transcribe using our AI module
        transcription = transcribe_audio(
            audio_file_path=temp_file_path,
            language=language,
            prompt=context_prompt
        )
        
        # Calculate metrics
        processing_time = (time.time() - start_time) * 1000
        
        logger.info(f"Transcription completed: {len(transcription)} characters in {processing_time:.2f}ms")
        
        return TranscriptionResponse(
            transcription=transcription,
            language_detected=language,  # TODO: Actual language detection
            confidence_score=None,  # TODO: Add confidence scoring
            duration_seconds=None,  # TODO: Add duration calculation
            processing_time_ms=processing_time
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except FileNotFoundError as e:
        logger.error(f"File handling error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File processing error"
        )
        
    except ValueError as e:
        # Input validation errors from transcriber
        logger.warning(f"Transcription validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    except RuntimeError as e:
        # API processing errors from transcriber
        logger.error(f"Transcription processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
        
    except Exception as e:
        # Unexpected errors
        logger.error(f"Unexpected transcription error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transcription service temporarily unavailable"
        )
        
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            try:
                Path(temp_file_path).unlink()
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {temp_file_path}: {e}")

@router.get(
    "/transcribe/formats",
    summary="Get supported audio formats",
    description="Returns list of supported audio file formats and size limits"
)
async def get_supported_formats():
    """Get information about supported audio formats and limits."""
    return {
        "supported_formats": list(SUPPORTED_FORMATS),
        "max_file_size_mb": MAX_FILE_SIZE / (1024 * 1024),
        "recommended_formats": [".mp3", ".wav", ".m4a"],
        "languages_supported": "auto-detect or specify ISO language code"
    }