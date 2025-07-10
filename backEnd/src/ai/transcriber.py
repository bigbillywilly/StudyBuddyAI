"""
Audio transcription module for StudyBuddy AI

Handles speech-to-text conversion using OpenAI's Whisper API.
Supports multiple audio formats and provides accurate transcription
for students who learn better through audio content.
"""

import logging
import os
from pathlib import Path
from typing import Optional
from openai import OpenAI

logger = logging.getLogger(__name__)

# DON'T create client at module level - do it in functions
# client = OpenAI()  # ❌ This causes the error

# Supported audio formats by Whisper API
SUPPORTED_FORMATS = {'.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB limit from OpenAI

def get_openai_client():
    """Get OpenAI client with proper API key handling."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    
    return OpenAI(api_key=api_key)

def transcribe_audio(
    audio_file_path: str,
    language: Optional[str] = None,
    prompt: Optional[str] = None
) -> str:
    """
    Transcribes audio to text using OpenAI Whisper API.
    
    Designed for educational content like lecture recordings, study notes,
    or student-recorded explanations. Optimized for academic vocabulary.
    
    Args:
        audio_file_path: Path to audio file
        language: Optional language code (e.g., 'en', 'es') for better accuracy
        prompt: Optional text to guide transcription context
        
    Returns:
        Transcribed text as string
        
    Raises:
        FileNotFoundError: Audio file doesn't exist
        ValueError: Unsupported file format or size
        RuntimeError: Transcription API failure
        
    Example:
        >>> transcribe_audio("lecture.mp3", language="en")
        "Today we'll discuss photosynthesis..."
    """
    # Validate file exists
    audio_path = Path(audio_file_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
    
    # Validate file format
    file_extension = audio_path.suffix.lower()
    if file_extension not in SUPPORTED_FORMATS:
        raise ValueError(
            f"Unsupported audio format: {file_extension}. "
            f"Supported formats: {', '.join(sorted(SUPPORTED_FORMATS))}"
        )
    
    # Validate file size
    file_size = audio_path.stat().st_size
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        raise ValueError(
            f"Audio file too large: {size_mb:.1f}MB. "
            f"Maximum size: {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )
    
    if file_size == 0:
        raise ValueError("Audio file is empty")
    
    # Get client when needed, not at module level
    client = get_openai_client()
    
    try:
        with open(audio_file_path, "rb") as audio_file:
            # Prepare transcription parameters
            transcription_params = {
                "model": "whisper-1",
                "file": audio_file,
                "response_format": "text"
            }
            
            # Add optional parameters if provided
            if language:
                transcription_params["language"] = language
                
            if prompt:
                # Use prompt to improve accuracy for educational content
                transcription_params["prompt"] = prompt
            else:
                # Default educational context prompt
                transcription_params["prompt"] = (
                    "This is educational content about academic subjects. "
                    "Please transcribe with attention to technical and academic vocabulary."
                )
            
            logger.info(f"Starting transcription of {audio_path.name} ({file_size} bytes)")
            
            response = client.audio.transcriptions.create(**transcription_params)
            
            # Whisper returns text directly when response_format is "text"
            transcribed_text = response.strip()
            
            if not transcribed_text:
                logger.warning("Whisper returned empty transcription")
                return "No speech detected in the audio file."
            
            logger.info(f"Successfully transcribed {len(transcribed_text)} characters")
            return transcribed_text
            
    except FileNotFoundError:
        # Re-raise file errors as-is
        raise
        
    except Exception as e:
        logger.error(f"Transcription failed for {audio_file_path}: {e}")
        
        # Provide helpful error messages based on common issues
        error_message = str(e).lower()
        if "rate limit" in error_message:
            raise RuntimeError("Transcription service is busy. Please try again in a moment.")
        elif "quota" in error_message:
            raise RuntimeError("Transcription quota exceeded. Please contact support.")
        elif "invalid" in error_message:
            raise RuntimeError("Audio file format not supported or corrupted.")
        else:
            raise RuntimeError(f"Transcription failed: {str(e)}")


def get_audio_duration(audio_file_path: str) -> Optional[float]:
    """
    Get audio file duration in seconds (requires additional dependency).
    
    This is a helper function for UI progress indicators and cost estimation.
    
    Note: Requires 'mutagen' or similar audio library for implementation.
    """
    # TODO: Implement with audio library like mutagen
    # For now, return None to indicate duration is unknown
    return None


def estimate_transcription_cost(audio_file_path: str) -> float:
    """
    Estimate transcription cost based on audio duration.
    
    OpenAI charges $0.006 per minute for Whisper API.
    """
    duration = get_audio_duration(audio_file_path)
    if duration is None:
        return 0.0  # Unknown duration
        
    minutes = duration / 60
    return round(minutes * 0.006, 4)