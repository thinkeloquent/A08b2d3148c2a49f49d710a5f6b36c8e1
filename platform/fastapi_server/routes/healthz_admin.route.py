import os
from fastapi import FastAPI, Request


def mount(app: FastAPI):
    """
    Admin route to display environment variables.
    WARNING: This endpoint exposes sensitive information. Secure in production.
    """
    @app.get("/healthz/admin")
    async def healthz_admin(request: Request):
        return {
            "env": dict(os.environ),
        }
