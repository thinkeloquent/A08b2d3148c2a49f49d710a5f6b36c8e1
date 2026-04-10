"""
Backup and restore service for Confluence Data Center REST API v9.2.3.

Provides operations for site and space backup/restore, job management,
binary download of completed backups, and a polling utility for
long-running backup/restore jobs.
"""

from __future__ import annotations

import asyncio
import time
from collections.abc import Callable
from pathlib import Path
from typing import Any

from confluence_api.logger import create_logger
from confluence_api.multipart import build_multipart_files

log = create_logger("confluence_api", __file__)


class BackupService:
    """Service for Confluence backup and restore operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Site Backup / Restore ────────────────────────────────────────────

    def backup_site(self, data: dict) -> dict:
        """
        Initiate a full site backup.

        Args:
            data: Backup configuration (e.g. {"cbAttachments": True}).

        Returns:
            Job submission dict containing the job ID.
        """
        log.debug("backup_site called", {"data_keys": list(data.keys())})
        result = self._client.post("backup/site", json_data=data)
        log.info("backup_site succeeded", {"job_id": result.get("id")})
        return result

    def restore_site(self, data: dict) -> dict:
        """
        Initiate a site restore from a server-side file.

        Args:
            data: Restore configuration including the filename on the server.

        Returns:
            Job submission dict.
        """
        log.debug("restore_site called", {"data_keys": list(data.keys())})
        result = self._client.post("backup/site/restore", json_data=data)
        log.info("restore_site succeeded", {"job_id": result.get("id")})
        return result

    def restore_site_upload(self, file_path: str) -> dict:
        """
        Restore a site from an uploaded backup file (multipart upload).

        Args:
            file_path: Path to the backup file on disk.

        Returns:
            Job submission dict.
        """
        log.debug("restore_site_upload called", {"file_path": file_path})
        files = build_multipart_files(file_path)
        result = self._client.post("backup/site/restore/upload", files=files)
        log.info("restore_site_upload succeeded")
        return result

    # ── Space Backup / Restore ───────────────────────────────────────────

    def backup_space(self, data: dict) -> dict:
        """
        Initiate a space backup.

        Args:
            data: Backup configuration including space key.

        Returns:
            Job submission dict.
        """
        log.debug("backup_space called", {"space_key": data.get("spaceKey")})
        result = self._client.post("backup/space", json_data=data)
        log.info("backup_space succeeded", {"job_id": result.get("id")})
        return result

    def restore_space(self, data: dict) -> dict:
        """
        Initiate a space restore from a server-side file.

        Args:
            data: Restore configuration including the filename on the server.

        Returns:
            Job submission dict.
        """
        log.debug("restore_space called", {"data_keys": list(data.keys())})
        result = self._client.post("backup/space/restore", json_data=data)
        log.info("restore_space succeeded", {"job_id": result.get("id")})
        return result

    def restore_space_upload(self, file_path: str) -> dict:
        """
        Restore a space from an uploaded backup file (multipart upload).

        Args:
            file_path: Path to the backup file on disk.

        Returns:
            Job submission dict.
        """
        log.debug("restore_space_upload called", {"file_path": file_path})
        files = build_multipart_files(file_path)
        result = self._client.post("backup/space/restore/upload", files=files)
        log.info("restore_space_upload succeeded")
        return result

    # ── Job Management ───────────────────────────────────────────────────

    def get_jobs(self) -> dict:
        """Retrieve all backup/restore jobs."""
        log.debug("get_jobs called")
        result = self._client.get("backup/jobs")
        log.info("get_jobs succeeded")
        return result

    def get_job(self, job_id: str) -> dict:
        """Retrieve the status of a specific backup/restore job."""
        log.debug("get_job called", {"job_id": job_id})
        result = self._client.get(f"backup/jobs/{job_id}")
        log.info("get_job succeeded", {"job_id": job_id})
        return result

    def download_job(self, job_id: str) -> bytes:
        """
        Download the completed backup file for a job.

        Returns raw bytes of the backup file. Uses the client's get_raw
        method to avoid JSON parsing of binary data.

        Args:
            job_id: The job ID whose output file to download.

        Returns:
            Raw bytes of the backup archive.
        """
        log.debug("download_job called", {"job_id": job_id})
        response = self._client.get_raw(f"backup/jobs/{job_id}/download")
        content: bytes = response.content
        log.info("download_job succeeded", {
            "job_id": job_id,
            "size_bytes": len(content),
        })
        return content

    def clear_job_queue(self) -> dict:
        """Clear all completed jobs from the queue."""
        log.debug("clear_job_queue called")
        result = self._client.delete("backup/jobs")
        log.info("clear_job_queue succeeded")
        return result

    def cancel_job(self, job_id: str) -> dict:
        """Cancel a running backup/restore job."""
        log.debug("cancel_job called", {"job_id": job_id})
        result = self._client.delete(f"backup/jobs/{job_id}")
        log.info("cancel_job succeeded", {"job_id": job_id})
        return result

    def list_restore_files(self) -> dict:
        """List available restore files on the server."""
        log.debug("list_restore_files called")
        result = self._client.get("backup/restore/files")
        log.info("list_restore_files succeeded")
        return result

    # ── Polling Utility ──────────────────────────────────────────────────

    def poll_job(
        self,
        job_id: str,
        interval: float = 2.0,
        timeout: float = 300.0,
        on_progress: Callable[[dict], None] | None = None,
    ) -> dict:
        """
        Poll a backup/restore job until completion or timeout.

        Periodically checks the job status and optionally invokes a progress
        callback. Returns the final job status dict.

        Args:
            job_id: The job ID to poll.
            interval: Seconds between poll requests (default 2.0).
            timeout: Maximum seconds to wait before raising TimeoutError (default 300.0).
            on_progress: Optional callback invoked with the job status dict on each poll.

        Returns:
            Final job status dict.

        Raises:
            TimeoutError: If the job does not complete within the timeout period.
        """
        log.debug("poll_job started", {
            "job_id": job_id,
            "interval": interval,
            "timeout": timeout,
        })
        start_time = time.monotonic()

        while True:
            elapsed = time.monotonic() - start_time
            if elapsed >= timeout:
                log.error("poll_job timed out", {"job_id": job_id, "elapsed": elapsed})
                raise TimeoutError(
                    f"Backup/restore job '{job_id}' did not complete within {timeout}s"
                )

            job_status = self.get_job(job_id)

            if on_progress is not None:
                on_progress(job_status)

            state = job_status.get("state", "").upper()

            if state in ("COMPLETE", "COMPLETED", "SUCCESS"):
                log.info("poll_job completed successfully", {
                    "job_id": job_id,
                    "elapsed": round(elapsed, 2),
                })
                return job_status

            if state in ("FAILED", "ERROR", "CANCELLED"):
                log.error("poll_job ended with failure state", {
                    "job_id": job_id,
                    "state": state,
                    "elapsed": round(elapsed, 2),
                })
                return job_status

            log.debug("poll_job waiting", {
                "job_id": job_id,
                "state": state,
                "elapsed": round(elapsed, 2),
            })
            time.sleep(interval)


class AsyncBackupService:
    """Async service for Confluence backup and restore operations."""

    def __init__(self, client: Any) -> None:
        self._client = client

    # ── Site Backup / Restore ────────────────────────────────────────────

    async def backup_site(self, data: dict) -> dict:
        """Initiate a full site backup."""
        log.debug("backup_site called", {"data_keys": list(data.keys())})
        result = await self._client.post("backup/site", json_data=data)
        log.info("backup_site succeeded", {"job_id": result.get("id")})
        return result

    async def restore_site(self, data: dict) -> dict:
        """Initiate a site restore from a server-side file."""
        log.debug("restore_site called", {"data_keys": list(data.keys())})
        result = await self._client.post("backup/site/restore", json_data=data)
        log.info("restore_site succeeded", {"job_id": result.get("id")})
        return result

    async def restore_site_upload(self, file_path: str) -> dict:
        """Restore a site from an uploaded backup file (multipart upload)."""
        log.debug("restore_site_upload called", {"file_path": file_path})
        files = build_multipart_files(file_path)
        result = await self._client.post("backup/site/restore/upload", files=files)
        log.info("restore_site_upload succeeded")
        return result

    # ── Space Backup / Restore ───────────────────────────────────────────

    async def backup_space(self, data: dict) -> dict:
        """Initiate a space backup."""
        log.debug("backup_space called", {"space_key": data.get("spaceKey")})
        result = await self._client.post("backup/space", json_data=data)
        log.info("backup_space succeeded", {"job_id": result.get("id")})
        return result

    async def restore_space(self, data: dict) -> dict:
        """Initiate a space restore from a server-side file."""
        log.debug("restore_space called", {"data_keys": list(data.keys())})
        result = await self._client.post("backup/space/restore", json_data=data)
        log.info("restore_space succeeded", {"job_id": result.get("id")})
        return result

    async def restore_space_upload(self, file_path: str) -> dict:
        """Restore a space from an uploaded backup file (multipart upload)."""
        log.debug("restore_space_upload called", {"file_path": file_path})
        files = build_multipart_files(file_path)
        result = await self._client.post("backup/space/restore/upload", files=files)
        log.info("restore_space_upload succeeded")
        return result

    # ── Job Management ───────────────────────────────────────────────────

    async def get_jobs(self) -> dict:
        """Retrieve all backup/restore jobs."""
        log.debug("get_jobs called")
        result = await self._client.get("backup/jobs")
        log.info("get_jobs succeeded")
        return result

    async def get_job(self, job_id: str) -> dict:
        """Retrieve the status of a specific backup/restore job."""
        log.debug("get_job called", {"job_id": job_id})
        result = await self._client.get(f"backup/jobs/{job_id}")
        log.info("get_job succeeded", {"job_id": job_id})
        return result

    async def download_job(self, job_id: str) -> bytes:
        """
        Download the completed backup file for a job.

        Returns raw bytes of the backup file. Uses the client's get_raw
        method to avoid JSON parsing of binary data.

        Args:
            job_id: The job ID whose output file to download.

        Returns:
            Raw bytes of the backup archive.
        """
        log.debug("download_job called", {"job_id": job_id})
        response = await self._client.get_raw(f"backup/jobs/{job_id}/download")
        content: bytes = response.content
        log.info("download_job succeeded", {
            "job_id": job_id,
            "size_bytes": len(content),
        })
        return content

    async def clear_job_queue(self) -> dict:
        """Clear all completed jobs from the queue."""
        log.debug("clear_job_queue called")
        result = await self._client.delete("backup/jobs")
        log.info("clear_job_queue succeeded")
        return result

    async def cancel_job(self, job_id: str) -> dict:
        """Cancel a running backup/restore job."""
        log.debug("cancel_job called", {"job_id": job_id})
        result = await self._client.delete(f"backup/jobs/{job_id}")
        log.info("cancel_job succeeded", {"job_id": job_id})
        return result

    async def list_restore_files(self) -> dict:
        """List available restore files on the server."""
        log.debug("list_restore_files called")
        result = await self._client.get("backup/restore/files")
        log.info("list_restore_files succeeded")
        return result

    # ── Polling Utility ──────────────────────────────────────────────────

    async def poll_job(
        self,
        job_id: str,
        interval: float = 2.0,
        timeout: float = 300.0,
        on_progress: Callable[[dict], None] | None = None,
    ) -> dict:
        """
        Poll a backup/restore job until completion or timeout.

        Periodically checks the job status and optionally invokes a progress
        callback. Returns the final job status dict.

        Args:
            job_id: The job ID to poll.
            interval: Seconds between poll requests (default 2.0).
            timeout: Maximum seconds to wait before raising TimeoutError (default 300.0).
            on_progress: Optional callback invoked with the job status dict on each poll.

        Returns:
            Final job status dict.

        Raises:
            TimeoutError: If the job does not complete within the timeout period.
        """
        log.debug("poll_job started", {
            "job_id": job_id,
            "interval": interval,
            "timeout": timeout,
        })
        start_time = time.monotonic()

        while True:
            elapsed = time.monotonic() - start_time
            if elapsed >= timeout:
                log.error("poll_job timed out", {"job_id": job_id, "elapsed": elapsed})
                raise TimeoutError(
                    f"Backup/restore job '{job_id}' did not complete within {timeout}s"
                )

            job_status = await self.get_job(job_id)

            if on_progress is not None:
                on_progress(job_status)

            state = job_status.get("state", "").upper()

            if state in ("COMPLETE", "COMPLETED", "SUCCESS"):
                log.info("poll_job completed successfully", {
                    "job_id": job_id,
                    "elapsed": round(elapsed, 2),
                })
                return job_status

            if state in ("FAILED", "ERROR", "CANCELLED"):
                log.error("poll_job ended with failure state", {
                    "job_id": job_id,
                    "state": state,
                    "elapsed": round(elapsed, 2),
                })
                return job_status

            log.debug("poll_job waiting", {
                "job_id": job_id,
                "state": state,
                "elapsed": round(elapsed, 2),
            })
            await asyncio.sleep(interval)
