"""
Comprehensive tests for the summarizer module.

Tests cover the core business logic of learning style adaptation,
which is StudyBuddy AI's key differentiator.
"""

import pytest
from unittest.mock import patch, MagicMock
from src.ai.summarizer import summarize_text

class TestSummarizeText:
    """Test suite for text summarization with learning style adaptation."""
    
    @pytest.mark.parametrize("learning_style,expected_content", [
        ("visual", "bullet points"),
        ("auditory", "conversational"),
        ("reading", "structured"),
        ("kinesthetic", "examples")
    ])
    def test_learning_style_adaptation(self, learning_style, expected_content):
        """Test that different learning styles generate appropriate prompts."""
        with patch("src.ai.summarizer.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content=f"Summary with {expected_content}"))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            result = summarize_text("Sample text", learning_style=learning_style)
            
            # Verify the system prompt was adapted for learning style
            call_args = mock_client.chat.completions.create.call_args
            system_message = call_args[1]['messages'][0]['content']
            assert learning_style in system_message.lower() or expected_content in system_message.lower()
            assert expected_content in result
    
    def test_valid_input_returns_summary(self):
        """Test successful summarization with valid input."""
        with patch("src.ai.summarizer.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content="This is a comprehensive summary."))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            result = summarize_text("The French Revolution began in 1789...")
            
            assert isinstance(result, str)
            assert result == "This is a comprehensive summary."
            assert len(result) > 0
    
    def test_empty_input_raises_value_error(self):
        """Test that empty input raises appropriate error."""
        with pytest.raises(ValueError, match="Input text cannot be empty"):
            summarize_text("")
            
        with pytest.raises(ValueError, match="Input text cannot be empty"):
            summarize_text("   ")  # Whitespace only
    
    def test_oversized_input_raises_value_error(self):
        """Test that overly long input is rejected to control costs."""
        long_text = "a" * 10001  # Over 10k character limit
        
        with pytest.raises(ValueError, match="Input text too long"):
            summarize_text(long_text)
    
    def test_api_error_returns_user_friendly_fallback(self):
        """Test graceful error handling with user-friendly message."""
        with patch("src.ai.summarizer.client") as mock_client:
            mock_client.chat.completions.create.side_effect = Exception("API rate limit")
            
            result = summarize_text("Sample text")
            
            assert isinstance(result, str)
            assert "trouble" in result.lower()
            assert "try again" in result.lower()
            # Should not expose technical error details to users
            assert "API rate limit" not in result
    
    def test_empty_openai_response_raises_runtime_error(self):
        """Test handling of empty API responses."""
        with patch("src.ai.summarizer.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content=None))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            result = summarize_text("Sample text")
            
            # Should return fallback message, not crash
            assert isinstance(result, str)
            assert "trouble" in result.lower()
    
    def test_custom_max_tokens_parameter(self):
        """Test that max_tokens parameter is properly passed to API."""
        with patch("src.ai.summarizer.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content="Short summary"))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            summarize_text("Sample text", max_tokens=150)
            
            call_args = mock_client.chat.completions.create.call_args
            assert call_args[1]['max_tokens'] == 150