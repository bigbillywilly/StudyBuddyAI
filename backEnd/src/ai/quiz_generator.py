"""
Quiz generator module for StudyBuddy AI

Generates adaptive quizzes based on learning content and user performance.
Integrates with learning style preferences for personalized question formats.
"""

import logging
import json
import os
from typing import List, Dict, Optional, Any
from openai import OpenAI

logger = logging.getLogger(__name__)

def get_openai_client():
    """Get OpenAI client with proper API key handling."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    
    return OpenAI(api_key=api_key)

def generate_quiz(
    text: str, 
    num_questions: int = 3,
    difficulty: str = "high_school",
    learning_style: str = "reading"
) -> List[Dict[str, Any]]:
    """
    Generates adaptive quiz questions from educational text.
    
    Creates questions that match the student's learning style and appropriate
    difficulty level. This supports StudyBuddy AI's personalized learning approach.
    
    Args:
        text: Source content for quiz generation
        num_questions: Number of questions to generate (1-10)
        difficulty: Question complexity level
            - "middle_school": Basic comprehension
            - "high_school": Analysis and inference  
            - "college": Critical thinking and synthesis
        learning_style: How to format questions
            - "visual": Include diagrams/chart references
            - "auditory": Conversational question style
            - "reading": Traditional text-based format
            - "kinesthetic": Application-based scenarios
            
    Returns:
        List of quiz questions with format:
        [
            {
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "A",
                "explanation": "Why this answer is correct",
                "difficulty": "medium"
            }
        ]
        
    Raises:
        ValueError: Invalid input parameters
        RuntimeError: API or parsing failures
        
    Example:
        >>> generate_quiz("Photosynthesis is...", 2, "high_school", "visual")
        [{"question": "Which diagram best shows...", ...}]
    """
    # Input validation
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty")
        
    if not 1 <= num_questions <= 10:
        raise ValueError("Number of questions must be between 1 and 10")
        
    if len(text) > 8000:
        raise ValueError("Text too long for quiz generation (max 8000 characters)")
    
    # Get client when needed
    client = get_openai_client()
    
    # Difficulty-based instruction
    difficulty_prompts = {
        "middle_school": "Create basic comprehension questions that test understanding of main ideas and key facts.",
        "high_school": "Create questions that test analysis, inference, and deeper understanding beyond memorization.",
        "college": "Create advanced questions requiring critical thinking, synthesis, and evaluation of complex concepts."
    }
    
    # Learning style adaptations
    style_adaptations = {
        "visual": "Include references to diagrams, charts, or visual representations when relevant. Use clear, structured question formats.",
        "auditory": "Write questions in a conversational style that sound natural when read aloud. Use rhythm and flow.",
        "reading": "Use traditional academic question formats with precise language and clear structure.",
        "kinesthetic": "Focus on application scenarios, real-world examples, and hands-on problem-solving situations."
    }
    
    system_prompt = f"""You are an expert educational assessment creator for StudyBuddy AI.
    
    Create {num_questions} multiple-choice questions from the given text.
    
    Difficulty level: {difficulty}
    {difficulty_prompts.get(difficulty, difficulty_prompts['high_school'])}
    
    Learning style adaptation: {learning_style}
    {style_adaptations.get(learning_style, style_adaptations['reading'])}
    
    Requirements:
    - Each question must have exactly 4 options (A, B, C, D)
    - Only one correct answer per question
    - Include explanation for why the correct answer is right
    - Questions should test understanding, not just memorization
    - Use inclusive, encouraging language
    
    Return ONLY valid JSON in this exact format:
    [
        {{
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "A",
            "explanation": "Explanation of why A is correct",
            "difficulty": "easy|medium|hard"
        }}
    ]"""
    
    user_prompt = f"Generate quiz questions from this content:\n\n{text.strip()}"
    
    raw_content = None
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,  # Lower temperature for consistent quiz format
            max_tokens=1500
        )
        
        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("OpenAI returned empty response")
        
        # Clean common JSON formatting issues
        cleaned_content = raw_content.strip()
        if cleaned_content.startswith("```json"):
            cleaned_content = cleaned_content[7:]
        if cleaned_content.endswith("```"):
            cleaned_content = cleaned_content[:-3]
        cleaned_content = cleaned_content.strip()
        
        # Parse and validate JSON structure
        quiz_questions = json.loads(cleaned_content)
        
        if not isinstance(quiz_questions, list):
            raise ValueError("Quiz response must be a list of questions")
            
        # Validate each question structure
        for i, question in enumerate(quiz_questions):
            required_fields = ["question", "options", "correct_answer", "explanation"]
            missing_fields = [field for field in required_fields if field not in question]
            if missing_fields:
                raise ValueError(f"Question {i+1} missing fields: {missing_fields}")
                
            if len(question["options"]) != 4:
                raise ValueError(f"Question {i+1} must have exactly 4 options")
                
            if question["correct_answer"] not in ["A", "B", "C", "D"]:
                raise ValueError(f"Question {i+1} correct_answer must be A, B, C, or D")
        
        logger.info(f"Successfully generated {len(quiz_questions)} quiz questions")
        return quiz_questions
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse quiz JSON: {e}\nRaw content: {raw_content}")
        raise RuntimeError("Failed to generate properly formatted quiz questions")
        
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")
        raise RuntimeError(f"Unable to generate quiz: {str(e)}")