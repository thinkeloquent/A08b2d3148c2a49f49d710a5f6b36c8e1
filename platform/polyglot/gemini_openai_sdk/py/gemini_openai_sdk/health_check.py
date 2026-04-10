"""
Health Check Module

Performs health check by making a minimal LLM call using the flash model.
"""

import time
from typing import Any, Dict, Optional

from .client import chat_completion
from .constants import DEFAULT_MODEL, MODELS, SYSTEM_PROMPT
from .logger import create

logger = create("gemini_openai_sdk", __file__)


async def health_check(
    model_type: Optional[str] = None,
    system_prompt: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Perform health check with LLM status verification.

    Args:
        model_type: Default model type
        system_prompt: System prompt

    Returns:
        Health status dictionary with LLM connectivity check
    """
    start_time = time.time()
    logger.debug("health_check: starting")

    model_type = model_type or DEFAULT_MODEL
    system_prompt = system_prompt or SYSTEM_PROMPT

    llm_status = "unknown"
    llm_error = None
    llm_response_time = None

    try:
        # Make a minimal LLM call using flash model for speed
        response = await chat_completion(
            messages=[{"role": "user", "content": "ping"}],
            model=MODELS["flash"],
            max_tokens=5,
            temperature=0,
        )

        llm_response_time = int((time.time() - start_time) * 1000)
        content = response.get("choices", [{}])[0].get("message", {}).get("content")
        llm_status = "connected" if content else "error"
        logger.debug("health_check: LLM ping successful", response_time_ms=llm_response_time)
    except Exception as err:
        llm_response_time = int((time.time() - start_time) * 1000)
        llm_status = "error"
        llm_error = str(err)
        logger.error("health_check: LLM ping failed", error=llm_error)

    total_time = int((time.time() - start_time) * 1000)

    return {
        "status": "healthy" if llm_status == "connected" else "unhealthy",
        "llm_status": llm_status,
        "llm_error": llm_error,
        "llm_response_time_ms": llm_response_time,
        "models": MODELS,
        "default_model": model_type,
        "system_prompt": system_prompt,
        "total_time_ms": total_time,
    }
