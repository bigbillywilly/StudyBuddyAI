"""
Comprehensive tests for audio transcription functionality.

Tests file validation, API integration, and error handling
for the speech-to-text feature of StudyBuddy AI.
"""

import pytest
import tempfile
import os
from pathlib import Path
from unittest.mock import patch, MagicMock
from src.ai.transcriber import transcribe_audio, SUPPORTED_FORMATS, MAX_FILE_SIZE

class TestTranscribeAudio:
    """Test suite for audio transcription functionality."""
    
    @pytest.fixture
    def valid_audio_file(self):
        """Create a temporary audio file for testing."""
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            temp_file.write(b"fake audio content for testing")
            temp_file.flush()
            yield temp_file.name
        
        # Cleanup
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
    
    @pytest.fixture
    def oversized_audio_file(self):
        """Create an oversized audio file for testing size limits."""
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            # Write data larger than MAX_FILE_SIZE
            temp_file.write(b"x" * (MAX_FILE_SIZE + 1))
            temp_file.flush()
            yield temp_file.name
        
        # Cleanup
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
    
    def test_transcribe_valid_file_returns_text(self, valid_audio_file):
        """Test successful transcription of valid audio file."""
        mock_transcription = "This is a mock transcription of educational content"
        
        with patch("src.ai.transcriber.client") as mock_client:
            mock_client.audio.transcriptions.create.return_value = mock_transcription
            
            result = transcribe_audio(valid_audio_file)
            
            assert result == mock_transcription
            
            # Verify API was called with correct parameters
            call_args = mock_client.audio.transcriptions.create.call_args
            assert call_args[1]["model"] == "whisper-1"
            assert call_args[1]["response_format"] == "text"
            assert "educational content" in call_args[1]["prompt"]
    
    def test_transcribe_with_language_parameter(self, valid_audio_file):
        """Test transcription with specific language parameter."""
        with patch("src.ai.transcriber.client") as mock_client:
            mock_client.audio.transcriptions.create.return_value = "Spanish transcription"
            
            result = transcribe_audio(valid_audio_file, language="es")
            
            call_args = mock_client.audio.transcriptions.create.call_args
            assert call_args[1]["language"] == "es"
            assert result == "Spanish transcription"
    
    def test_transcribe_with_custom_prompt(self, valid_audio_file):
        """Test transcription with custom context prompt."""
        custom_prompt = "This is a physics lecture about quantum mechanics"
        
        with patch("src.ai.transcriber.client") as mock_client:
            mock_client.audio.transcriptions.create.return_value = "Physics content"
            
            result = transcribe_audio(valid_audio_file, prompt=custom_prompt)
            
            call_args = mock_client.audio.transcriptions.create.call_args
            assert call_args[1]["prompt"] == custom_prompt
    
    def test_file_not_found_raises_error(self):
        """Test that missing files raise appropriate error."""
        with pytest.raises(FileNotFoundError, match="Audio file not found"):
            transcribe_audio("nonexistent/path/to/audio.mp3")
    
    @pytest.mark.parametrize("invalid_extension", [".txt", ".pdf", ".jpg", ".doc"])
    def test_unsupported_format_raises_error(self, invalid_extension):
        """Test that unsupported file formats raise appropriate errors."""
        with tempfile.NamedTemporaryFile(suffix=invalid_extension, delete=False) as temp_file:
            temp_file.write(b"fake content")
            temp_file.flush()
            
            try:
                with pytest.raises(ValueError, match="Unsupported audio format"):
                    transcribe_audio(temp_file.name)
            finally:
                os.unlink(temp_file.name)
    
    @pytest.mark.parametrize("valid_extension", [".mp3", ".wav", ".m4a", ".webm"])
    def test_supported_formats_are_accepted(self, valid_extension):
        """Test that all supported formats are properly validated."""
        with tempfile.NamedTemporaryFile(suffix=valid_extension, delete=False) as temp_file:
            temp_file.write(b"fake audio content")
            temp_file.flush()
            
            try:
                # Should not raise format error (will fail at API call, which we'll mock)
                with patch("src.ai.transcriber.client") as mock_client:
                    mock_client.audio.transcriptions.create.return_value = "test"
                    result = transcribe_audio(temp_file.name)
                    assert result == "test"
            finally:
                os.unlink(temp_file.name)
    
    def test_oversized_file_raises_error(self, oversized_audio_file):
        """Test that files exceeding size limit are rejected."""
        with pytest.raises(ValueError, match="Audio file too large"):
            transcribe_audio(oversized_audio_file)
    
    def test_empty_file_raises_error(self):
        """Test that empty files are rejected."""
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            # Don't write anything - file will be empty
            temp_file.flush()
            
            try:
                with pytest.raises(ValueError, match="Audio file is empty"):
                    transcribe_audio(temp_file.name)
            finally:
                os.unlink(temp_file.name)
    
    def test_empty_transcription_returns_helpful_message(self, valid_audio_file):
        """Test handling of empty transcription results."""
        with patch("src.ai.transcriber.client") as mock_client:
            mock_client.audio.transcriptions.create.return_value = ""
            
            result = transcribe_audio(valid_audio_file)
            
            assert "No speech detected" in result
    
    @pytest.mark.parametrize("error_type,expected_message", [
        ("rate limit exceeded", "service is busy"),
        ("quota exceeded", "quota exceeded"),
        ("invalid audio format", "format not supported"),
        ("unknown error", "Transcription failed")
    ])
    def test_api_errors_return_user_friendly_messages(self, valid_audio_file, error_type, expected_message):
        """Test that API errors are converted to user-friendly messages."""
        with patch("src.ai.transcriber.client") as mock_client:
            mock_client.audio.transcriptions.create.side_effect = Exception(error_type)
            
            with pytest.raises(RuntimeError) as exc_info:
                transcribe_audio(valid_audio_file)
            
            assert expected_message.lower() in str(exc_info.value).lower()
    
    def test_file_extension_case_insensitive(self):
        """Test that file extension validation is case-insensitive."""
        with tempfile.NamedTemporaryFile(suffix=".MP3", delete=False) as temp_file:
            temp_file.write(b"fake audio content")
            temp_file.flush()
            
            try:
                # Should not raise format error for uppercase extension
                with patch("src.ai.transcriber.client") as mock_client:
                    mock_client.audio.transcriptions.create.return_value = "test"
                    result = transcribe_audio(temp_file.name)
                    assert result == "test"
            finally:
                os.unlink(temp_file.name)
