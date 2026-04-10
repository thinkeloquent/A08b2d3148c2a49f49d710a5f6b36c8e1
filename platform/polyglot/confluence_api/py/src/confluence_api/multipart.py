"""
Multipart upload and binary download helpers for the Confluence API.

Provides utilities for:
- Building httpx-compatible multipart file uploads (attachment creation)
- Downloading binary content (attachment downloads, exports)
"""

from __future__ import annotations

import mimetypes
import os
from pathlib import Path
from typing import Any

from confluence_api.logger import create_logger

log = create_logger("confluence-api", __file__)


def build_multipart_files(
    file_path: str | Path,
    filename: str | None = None,
    content_type: str | None = None,
) -> dict[str, tuple[str, bytes, str]]:
    """
    Build an httpx-compatible files dict for multipart upload from a file path.

    Reads the file at the given path and returns the structure expected by
    httpx.Client.request(files=...).

    Args:
        file_path: Path to the file on disk.
        filename: Override filename in the upload. Defaults to the basename of file_path.
        content_type: Override MIME type. Auto-detected from extension if not provided.

    Returns:
        Dict with 'file' key mapped to (filename, content_bytes, content_type) tuple.

    Raises:
        FileNotFoundError: If file_path does not exist.
        IOError: If the file cannot be read.
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    resolved_filename = filename or path.name
    resolved_content_type = content_type or _guess_content_type(resolved_filename)

    log.debug("building multipart files", {
        "file_path": str(path),
        "filename": resolved_filename,
        "content_type": resolved_content_type,
    })

    file_bytes = path.read_bytes()

    return {
        "file": (resolved_filename, file_bytes, resolved_content_type),
    }


def build_multipart_data(
    file_content: bytes,
    filename: str,
    content_type: str = "application/octet-stream",
    comment: str | None = None,
    minor_edit: bool = False,
) -> tuple[dict[str, tuple[str, bytes, str]], dict[str, str]]:
    """
    Build multipart form data for Confluence attachment creation.

    Confluence attachment upload requires:
    - The file as multipart file field
    - Optional comment as form data
    - Optional minorEdit flag as form data

    Args:
        file_content: Raw bytes of the file to upload.
        filename: Name for the uploaded file.
        content_type: MIME type of the file. Defaults to 'application/octet-stream'.
        comment: Optional comment for the attachment version.
        minor_edit: If True, marks this as a minor edit (no notification).

    Returns:
        Tuple of (files_dict, data_dict) where:
        - files_dict: httpx-compatible files parameter
        - data_dict: httpx-compatible data parameter for form fields
    """
    log.debug("building multipart data", {
        "filename": filename,
        "content_type": content_type,
        "size_bytes": len(file_content),
        "minor_edit": minor_edit,
    })

    files: dict[str, tuple[str, bytes, str]] = {
        "file": (filename, file_content, content_type),
    }

    data: dict[str, str] = {}
    if comment is not None:
        data["comment"] = comment
    if minor_edit:
        data["minorEdit"] = "true"

    return files, data


async def download_binary(
    client: Any,
    endpoint: str,
    dest_path: str | Path | None = None,
) -> bytes:
    """
    Download binary content from a Confluence API endpoint.

    Uses the client's get_raw() method to fetch the raw response, then
    optionally writes the content to a destination file.

    Args:
        client: ConfluenceClient instance (must have .get_raw() method).
        endpoint: API endpoint path for the binary resource.
        dest_path: Optional file path to save the downloaded content to.

    Returns:
        The raw bytes of the downloaded content.

    Raises:
        IOError: If dest_path is provided but the file cannot be written.
    """
    log.debug("downloading binary", {"endpoint": endpoint, "dest_path": str(dest_path) if dest_path else None})

    response = client.get_raw(endpoint)
    content: bytes = response.content

    if dest_path is not None:
        dest = Path(dest_path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
        log.info("binary saved to file", {"dest_path": str(dest), "size_bytes": len(content)})

    return content


def _guess_content_type(filename: str) -> str:
    """
    Guess MIME type from a filename using mimetypes module.

    Falls back to 'application/octet-stream' if the type cannot be determined.

    Args:
        filename: The filename to guess the type for.

    Returns:
        MIME type string.
    """
    guessed, _ = mimetypes.guess_type(filename)
    return guessed or "application/octet-stream"
