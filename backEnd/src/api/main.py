"""
StudyBuddy AI - FastAPI Application Entry Point

This is the main server application that provides AI-powered study assistance
through RESTful APIs. Designed for high school students with learning difficulties.
"""

import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
# Add this at the top of your main.py file
from dotenv import load_dotenv
import os

# Load environment variables FIRST
load_dotenv()

# Debug print to verify it's loaded
print(f"API Key loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
api_key = os.getenv('OPENAI_API_KEY')
if api_key:
    print(f"API Key starts with: {api_key[:10]}...")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup tasks
    logger.info("🚀 StudyBuddy AI starting up...")
    logger.info("")
    yield
    # Shutdown tasks
    logger.info("📴 StudyBuddy AI shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="StudyBuddy AI API",
    description="""
    **AI-powered study assistant for students who have a hard time studying.**
    
    StudyBuddy AI provides personalized learning assistance through:
    
    * **Text Summarization**: Adapt content to visual, auditory, reading, or kinesthetic learning styles
    * **Quiz Generation**: Create practice questions from any educational content
    * **Audio Transcription**: Convert lecture recordings to searchable text
    * **Progress Tracking**: Monitor learning outcomes and identify improvement areas

    Built for Junee to help her succeed in her educational journey.
    """,
    version="1.0.0",
    contact={
        "name": "Willy",
        "email": "notyet@gmail.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.studybuddy-ai.com"]
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development
        "http://localhost:3001",  # Alternative development port
        "https://studybuddy-ai.vercel.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add response time header for monitoring."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully."""
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "An unexpected error occurred",
            "message": "Our team has been notified. Please try again later.",
            "request_id": str(time.time())
        }
    )

# ========================================
# ROUTE IMPORTS AND REGISTRATION
# ========================================

# Import route modules (moved here to avoid circular imports)
try:
    from src.api.routes.summarization import router as summarization_router
    app.include_router(summarization_router)
    logger.info("Summarization routes loaded")
except ImportError as e:
    logger.error(f"Failed to load summarization routes: {e}")

try:
    from src.api.routes.quiz import router as quiz_router
    app.include_router(quiz_router)
    logger.info("Quiz routes loaded")
except ImportError as e:
    logger.error(f"Failed to load quiz routes: {e}")

try:
    from src.api.routes.health import router as health_router
    app.include_router(health_router)
    logger.info("Health routes loaded")
except ImportError as e:
    logger.error(f"Failed to load health routes: {e}")
    
try:
    from src.api.routes.health import router as health_router
    app.include_router(health_router)
    logger.info("Health routes loaded")
except ImportError as e:
    logger.error(f"Failed to load health routes: {e}")

try:
    from src.api.routes.transcription import router as transcription_router
    app.include_router(transcription_router)
    logger.info(" Transcription routes loaded")
except ImportError as e:
    logger.error(f"Failed to load transcription routes: {e}")

# ========================================
# BASIC ENDPOINTS
# ========================================

# Basic health check endpoint (backup if health.router fails)
@app.get("/", 
         summary="Root Health Check",
         description="Basic root endpoint to verify API is running",
         tags=["Root"])
async def root():
    """Root endpoint - confirms API is accessible."""
    return {
        "message": "StudyBuddy AI API is running! 🚀",
        "documentation": "/docs",
        "health_check": "/health"
    }

# Additional fallback health endpoint
@app.get("/api/status")
async def api_status():
    """API status endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "StudyBuddy AI API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    # Development server configuration
    uvicorn.run(
        "src.api.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )