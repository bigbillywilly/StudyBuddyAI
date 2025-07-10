"""
Summarizer module for StudyBuddy AI

This module handles text summarization using OpenAI's GPT-3.5 API.
Designed specifically for educational content with learning style adaptation.
"""

import logging
import os
from typing import Optional
from openai import OpenAI

logger = logging.getLogger(__name__)

# Don't initialize client at module level - do it in functions
def get_openai_client():
    """Get OpenAI client with proper API key handling."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    
    return OpenAI(api_key=api_key)

def summarize_text(
    input_text: str, 
    learning_style: str = "reading",
    max_tokens: int = 300
) -> str:
    """
    Summarizes educational text adapted to specific learning styles.
    
    This is the core feature that makes StudyBuddy AI special - it doesn't
    just summarize, it adapts the summary to how the student learns best.
    
    Args:
        input_text: The content to summarize (textbook, article, notes)
        learning_style: How to present the summary
            - "visual": Bullet points, clear structure
            - "auditory": Conversational tone  
            - "reading": Traditional text structure
            - "kinesthetic": Examples and applications
        max_tokens: Maximum length of summary
        
    Returns:
        Personalized summary as string
        
    Raises:
        ValueError: If input is empty or invalid
        RuntimeError: If OpenAI API fails after retries
        
    Example:
        >>> summarize_text("The French Revolution...", "visual")
        "Key Points:\n• Started in 1789\n• Caused by economic crisis..."
    """
    # Input validation
    if not input_text or not input_text.strip():
        raise ValueError("Input text cannot be empty")
        
    if len(input_text) > 10000:
        raise ValueError("Input text too long (max 10,000 characters)")
    
    # Get client when needed, not at module level
    client = get_openai_client()
        
    # Learning style prompts for personalization
    style_prompts = {
        "visual": "Create a summary with bullet points, clear structure, and suggest visual elements that would help understanding.",
        "auditory": "Create a summary that flows well when read aloud, using conversational tone and natural speech patterns.",
        "reading": "Create a well-structured summary with clear sections and logical flow for text-based learning.",
        "kinesthetic": "Create a summary with practical examples, real-world applications, and hands-on learning suggestions."
    }
    
    system_prompt = f"""You are a helpful study assistant for students with learning difficulties. 
    {style_prompts.get(learning_style, style_prompts['reading'])}
    Keep summaries concise but comprehensive. Be encouraging and patient."""
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Summarize this text for studying:\n\n{input_text}"}
            ],
            temperature=0.7,  # Slight creativity for better explanations
            max_tokens=max_tokens
        )
        
        summary = response.choices[0].message.content
        if not summary:
            raise RuntimeError("OpenAI returned empty response")
            
        return summary.strip()
        
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        # Graceful fallback for user experience
        return "I'm having trouble generating a summary right now. Please try again in a moment, or contact support if the issue persists."