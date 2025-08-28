# StudyBuddyAI

StudyBuddyAI is a Python backend that uses OpenAI GPT and Whisper to transcribe lectures, summarize content, and generate quizzes. Made for my little cousin to use as a tool in highschool.

### Features
- Lecture transcription to convert spoken lectures into text  
- Content summarization to generate concise study notes  
- Quiz generation to build practice quizzes automatically  
- API-first design with FastAPI for integration with web or mobile clients  

### Tech Stack
- Backend: Python 3.12+, FastAPI  
- AI Models: OpenAI GPT, Whisper  
- Frontend (in progress): JavaScript, HTML, CSS  

### Getting Started
1. Clone the repository  
   ```bash
   git clone https://github.com/bigbillywilly/studybuddyai.git
   cd StudyBuddyAI
2. Install dependencies
   ```bash
   pip install -r requirements.txt
3. Run the FastAPI server
   ```bash
   uvicorn app.main:app --reload
4. Access the API documentation at
   ```bash
   http://127.0.0.1:8000/docs
