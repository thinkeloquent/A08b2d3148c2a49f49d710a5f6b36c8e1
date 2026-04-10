"""Health Route — Figma API SDK"""

from datetime import datetime, timezone

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    client = getattr(request.app.state, "figma_client", None)

    rate_limit = None
    if client:
        last = client.last_rate_limit
        stats = client.stats
        rate_limit = {
            "last_hit": {
                "retry_after": last.retry_after,
                "retry_after_minutes": last.retry_after_minutes,
                "plan_tier": last.plan_tier,
                "rate_limit_type": last.rate_limit_type,
                "timestamp": last.timestamp.isoformat(),
            } if last else None,
            "total_hits": stats.get("rate_limit_hits", 0),
            "total_waits": stats.get("rate_limit_waits", 0),
            "total_wait_seconds": stats.get("rate_limit_total_wait_seconds", 0.0),
        }

    return {
        "status": "ok",
        "service": "figma-api",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rate_limit": rate_limit,
    }
