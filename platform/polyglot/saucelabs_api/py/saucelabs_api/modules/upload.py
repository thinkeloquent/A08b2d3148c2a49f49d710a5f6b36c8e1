"""
Upload Module — Sauce Labs API Client (Mobile Distribution)

Upload mobile binaries (APK, IPA, AAB) for distribution and testing.

Endpoint:
    POST /api/upload/   (Mobile Distribution base URL)
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from ..errors import SaucelabsValidationError
from ..logger import create_logger
from ..types import VALID_UPLOAD_EXTENSIONS

log = create_logger("saucelabs_api", "upload")


class UploadModule:
    """Upload mobile app binaries to Sauce Labs."""

    def __init__(self, client: Any) -> None:
        self._client = client
        self._logger = log

    async def upload_app(
        self,
        *,
        file: str | bytes,
        api_key: str,
        app_name: str | None = None,
        upload_to_saucelabs: bool = False,
        notify: bool = False,
    ) -> dict[str, Any]:
        """Upload a mobile app binary.

        Parameters
        ----------
        file:
            File path (str) or bytes content.
        api_key:
            Distribution API key.
        app_name:
            Optional display name for the app.
        upload_to_saucelabs:
            Also upload to Real Device Cloud storage.
        notify:
            Email testers about the upload.
        """
        if not file:
            raise SaucelabsValidationError("file is required for upload")
        if not api_key:
            raise SaucelabsValidationError("api_key is required for mobile upload")

        # Resolve file content
        if isinstance(file, str):
            file_path = Path(file)
            ext = file_path.suffix.lower()
            if ext not in VALID_UPLOAD_EXTENSIONS:
                raise SaucelabsValidationError(
                    f"file must have extension: {', '.join(VALID_UPLOAD_EXTENSIONS)} — got '{ext}'"
                )
            if not file_path.exists():
                raise SaucelabsValidationError(f"file does not exist: {file}")
            file_content = file_path.read_bytes()
            file_name = file_path.name
        elif isinstance(file, bytes):
            file_content = file
            file_name = f"{app_name or 'app'}.apk"
        else:
            raise SaucelabsValidationError("file must be a file path string or bytes")

        self._logger.info("uploading app", {
            "file_name": file_name,
            "app_name": app_name or file_name,
            "upload_to_saucelabs": upload_to_saucelabs,
            "notify": notify,
            "size_bytes": len(file_content),
        })

        # Build form data
        data: dict[str, str] = {"api_key": api_key}
        if app_name:
            data["app_name"] = app_name
        if upload_to_saucelabs:
            data["upload_to_saucelabs"] = "on"
        if notify:
            data["notify"] = "on"

        files = {"file": (file_name, file_content)}

        return await self._client.post(
            "/api/upload/",
            data=data,
            files=files,
            mobile=True,
        )
