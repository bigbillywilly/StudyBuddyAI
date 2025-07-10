"""
Comprehensive tests for quiz generation functionality.

Tests the core business logic of adaptive quiz generation with
learning style personalization and difficulty adjustment.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from src.ai.quiz_generator import generate_quiz

class TestGenerateQuiz:
    """Test suite for adaptive quiz generation."""
    
    @pytest.fixture
    def sample_quiz_response(self):
        """Mock quiz response in expected format."""
        return [
            {
                "question": "What is the main theme of the text?",
                "options": ["Theme A", "Theme B", "Theme C", "Theme D"],
                "correct_answer": "A",
                "explanation": "The text clearly states that Theme A is central.",
                "difficulty": "medium"
            },
            {
                "question": "Which conclusion can be drawn?",
                "options": ["Conclusion A", "Conclusion B", "Conclusion C", "Conclusion D"],
                "correct_answer": "C",
                "explanation": "Evidence in paragraph 2 supports Conclusion C.",
                "difficulty": "hard"
            }
        ]
    
    def test_generate_quiz_valid_input_returns_questions(self, sample_quiz_response):
        """Test successful quiz generation with valid input."""
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content=json.dumps(sample_quiz_response)))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            result = generate_quiz("Sample educational text", num_questions=2)
            
            assert isinstance(result, list)
            assert len(result) == 2
            
            # Verify question structure
            for question in result:
                assert "question" in question
                assert "options" in question
                assert "correct_answer" in question
                assert "explanation" in question
                assert len(question["options"]) == 4
                assert question["correct_answer"] in ["A", "B", "C", "D"]
    
    @pytest.mark.parametrize("learning_style,expected_keyword", [
        ("visual", "diagram"),
        ("auditory", "conversational"),
        ("reading", "academic"),
        ("kinesthetic", "application")
    ])
    def test_learning_style_adaptation_in_prompts(self, learning_style, expected_keyword):
        """Test that learning styles are reflected in system prompts."""
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content='[{"question": "test", "options": ["A","B","C","D"], "correct_answer": "A", "explanation": "test", "difficulty": "easy"}]'))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            generate_quiz("Sample text", learning_style=learning_style)
            
            # Check that system prompt includes learning style adaptation
            call_args = mock_client.chat.completions.create.call_args
            system_message = call_args[1]['messages'][0]['content']
            assert learning_style in system_message.lower()
    
    @pytest.mark.parametrize("difficulty,expected_complexity", [
        ("middle_school", "basic comprehension"),
        ("high_school", "analysis"),
        ("college", "critical thinking")
    ])
    def test_difficulty_level_adaptation(self, difficulty, expected_complexity):
        """Test that difficulty levels generate appropriate prompts."""
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content='[{"question": "test", "options": ["A","B","C","D"], "correct_answer": "A", "explanation": "test", "difficulty": "easy"}]'))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            generate_quiz("Sample text", difficulty=difficulty)
            
            call_args = mock_client.chat.completions.create.call_args
            system_message = call_args[1]['messages'][0]['content']
            assert expected_complexity.lower() in system_message.lower()
    
    def test_empty_input_raises_value_error(self):
        """Test that empty input raises appropriate error."""
        with pytest.raises(ValueError, match="Input text cannot be empty"):
            generate_quiz("")
            
        with pytest.raises(ValueError, match="Input text cannot be empty"):
            generate_quiz("   ")
    
    def test_invalid_question_count_raises_value_error(self):
        """Test validation of question count parameter."""
        with pytest.raises(ValueError, match="Number of questions must be between 1 and 10"):
            generate_quiz("Sample text", num_questions=0)
            
        with pytest.raises(ValueError, match="Number of questions must be between 1 and 10"):
            generate_quiz("Sample text", num_questions=11)
    
    def test_oversized_input_raises_value_error(self):
        """Test that overly long text is rejected."""
        long_text = "a" * 8001
        
        with pytest.raises(ValueError, match="Text too long"):
            generate_quiz(long_text)
    
    def test_malformed_json_response_raises_runtime_error(self):
        """Test handling of malformed API responses."""
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content="This is not valid JSON"))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            with pytest.raises(RuntimeError, match="Failed to generate properly formatted quiz"):
                generate_quiz("Sample text")
    
    def test_missing_question_fields_raises_runtime_error(self):
        """Test validation of question structure."""
        invalid_question = [
            {
                "question": "What is this?",
                "options": ["A", "B", "C"],  # Missing option D
                "correct_answer": "A"
                # Missing explanation field
            }
        ]
        
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content=json.dumps(invalid_question)))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            with pytest.raises(ValueError, match="must have exactly 4 options"):
                generate_quiz("Sample text")
    
    def test_api_error_raises_runtime_error(self):
        """Test handling of OpenAI API failures."""
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_client.chat.completions.create.side_effect = Exception("API failed")
            
            with pytest.raises(RuntimeError, match="Unable to generate quiz"):
                generate_quiz("Sample text")
    
    def test_code_block_json_cleaning(self):
        """Test that JSON wrapped in code blocks is properly cleaned."""
        quiz_data = [{"question": "test", "options": ["A","B","C","D"], "correct_answer": "A", "explanation": "test", "difficulty": "easy"}]
        wrapped_json = f"```json\n{json.dumps(quiz_data)}\n```"
        
        with patch("src.ai.quiz_generator.client") as mock_client:
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content=wrapped_json))
            ]
            mock_client.chat.completions.create.return_value = mock_response
            
            result = generate_quiz("Sample text")
            
            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]["question"] == "test"