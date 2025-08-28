StudyBuddyAI

StudyBuddyAI is a Python backend that uses OpenAI GPT and Whisper to transcribe lectures, summarize content, and generate quizzes. It provides students with AI-powered tools to make learning easier and more effective.

Features

Lecture transcription to convert spoken lectures into text

Content summarization to generate concise study notes

Quiz generation to build practice quizzes automatically

API-first design with FastAPI for integration with web or mobile clients

Tech Stack

Backend: Python 3.12+, FastAPI

AI Models: OpenAI GPT, Whisper

Frontend (in progress): JavaScript, HTML, CSS

Getting Started

Clone the repository

Install dependencies with pip install -r requirements.txt

Run the FastAPI server with uvicorn app.main:app --reload

Access the API documentation at http://127.0.0.1:8000/docs

Roadmap

Deploy backend to cloud (AWS or Render)

Build basic frontend with HTML, CSS, and JavaScript

Add authentication and user accounts

Expand quiz generation with adaptive difficulty
