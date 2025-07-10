"""
Health check routes for monitoring and load balancers.

These endpoints help us monitor system health and provide information
for debugging and operational monitoring.
"""

import time
from fastapi import APIRouter
from src.api.models import ErrorResponse

router = APIRouter(tags=["Health"])

@router.get(
    "/health",
    summary="Basic health check",
    description="Quick health check for load balancers and uptime monitoring."
)
async def health_check():
    """
    Basic health check endpoint.
    
    Returns immediately with system status. Used by:
    - Load balancers to check if service is up
    - Monitoring systems for uptime tracking
    - Quick status verification
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "StudyBuddy AI",
        "version": "1.0.0"
    }

@router.get(
    "/health/detailed",
    summary="Detailed health check",
    description="Comprehensive health information including dependencies and metrics."
)
async def detailed_health_check():
    """
    Detailed health check with dependency status.
    
    Provides comprehensive system information for monitoring dashboards
    and debugging. In production, this would check:
    - Database connectivity
    - OpenAI API status
    - Memory usage
    - Response time metrics
    """
    
    # TODO: Add actual health checks for production
    # - Test OpenAI API connectivity
    # - Check database connection
    # - Verify file system access
    # - Monitor memory/CPU usage
    
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "StudyBuddy AI",
        "version": "1.0.0",
        "features": {
            "summarization": "available",
            "quiz_generation": "available",
            "transcription": "available"
        },
        "dependencies": {
            "openai_api": "unknown",  # TODO: Actual connectivity test
            "database": "unknown"     # TODO: Actual connection test
        },
        "metrics": {
            "uptime_seconds": time.time(),  # TODO: Actual uptime tracking
            "total_requests": "unknown",    # TODO: Request counter
            "average_response_time": "unknown"  # TODO: Performance metrics
        }
    }