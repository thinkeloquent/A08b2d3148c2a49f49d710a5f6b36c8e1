"""
Streaming Support for fetch_httpx package.

Provides efficient streaming for large request/response bodies:
- Response streaming (aiter_bytes, aiter_text, aiter_lines)
- Request streaming (async iterator bodies)
- Stream state management (consumed, closed, not read)

Enables processing large files without loading entire payload into memory.
"""

from __future__ import annotations

import codecs
from collections.abc import AsyncIterator
from typing import (
    TYPE_CHECKING,
)

from . import logger as logger_module
from ._exceptions import ResponseNotRead, StreamClosed, StreamConsumed

if TYPE_CHECKING:
    pass

logger = logger_module.create("fetch_httpx", __file__)


# =============================================================================
# Stream State
# =============================================================================

class StreamState:
    """Track the state of a stream."""

    PENDING = "pending"      # Not yet started
    STREAMING = "streaming"  # Currently streaming
    CONSUMED = "consumed"    # Fully read
    CLOSED = "closed"        # Closed before completion

    def __init__(self) -> None:
        self._state = self.PENDING
        self._bytes_read = 0

    @property
    def state(self) -> str:
        return self._state

    @property
    def bytes_read(self) -> int:
        return self._bytes_read

    def start(self) -> None:
        """Mark stream as started."""
        if self._state == self.CONSUMED:
            raise StreamConsumed()
        if self._state == self.CLOSED:
            raise StreamClosed()
        self._state = self.STREAMING

    def read(self, num_bytes: int) -> None:
        """Record bytes read."""
        self._bytes_read += num_bytes

    def finish(self) -> None:
        """Mark stream as consumed."""
        self._state = self.CONSUMED
        logger.trace(
            "Stream consumed",
            context={"bytes_read": self._bytes_read}
        )

    def close(self) -> None:
        """Mark stream as closed."""
        self._state = self.CLOSED
        logger.trace(
            "Stream closed",
            context={"bytes_read": self._bytes_read}
        )

    def check_readable(self) -> None:
        """Check if stream can be read."""
        if self._state == self.CONSUMED:
            raise StreamConsumed()
        if self._state == self.CLOSED:
            raise StreamClosed()


# =============================================================================
# Byte Stream
# =============================================================================

class ByteStream:
    """
    Async iterator for streaming bytes.

    Wraps an async byte iterator with state tracking and logging.

    Example:
        async for chunk in byte_stream.aiter_bytes(chunk_size=1024):
            process(chunk)
    """

    def __init__(
        self,
        stream: AsyncIterator[bytes],
        *,
        content_length: int | None = None,
    ) -> None:
        self._stream = stream
        self._content_length = content_length
        self._state = StreamState()
        self._buffer = b""

    @property
    def is_consumed(self) -> bool:
        """True if stream has been fully consumed."""
        return self._state.state == StreamState.CONSUMED

    @property
    def is_closed(self) -> bool:
        """True if stream has been closed."""
        return self._state.state == StreamState.CLOSED

    async def aiter_bytes(
        self, chunk_size: int | None = None
    ) -> AsyncIterator[bytes]:
        """
        Iterate over response bytes.

        Args:
            chunk_size: Maximum chunk size. None means use source chunks.

        Yields:
            Byte chunks
        """
        self._state.check_readable()
        self._state.start()

        logger.debug(
            "Starting byte stream",
            context={
                "content_length": self._content_length,
                "chunk_size": chunk_size,
            }
        )

        try:
            async for chunk in self._stream:
                if chunk_size is None:
                    self._state.read(len(chunk))
                    yield chunk
                else:
                    # Buffer and yield fixed-size chunks
                    self._buffer += chunk
                    while len(self._buffer) >= chunk_size:
                        out_chunk = self._buffer[:chunk_size]
                        self._buffer = self._buffer[chunk_size:]
                        self._state.read(len(out_chunk))
                        yield out_chunk

            # Yield remaining buffer
            if self._buffer:
                self._state.read(len(self._buffer))
                yield self._buffer
                self._buffer = b""

            self._state.finish()

        except Exception as e:
            self._state.close()
            logger.error("Byte stream error", context={"error": str(e)})
            raise

    async def aread(self) -> bytes:
        """Read entire stream into bytes."""
        chunks = []
        async for chunk in self.aiter_bytes():
            chunks.append(chunk)
        return b"".join(chunks)

    async def aclose(self) -> None:
        """Close the stream."""
        if not self.is_consumed and not self.is_closed:
            self._state.close()
            # Attempt to close underlying stream if it has aclose
            if hasattr(self._stream, "aclose"):
                await self._stream.aclose()


# =============================================================================
# Text Stream
# =============================================================================

class TextStream:
    """
    Async iterator for streaming text.

    Wraps a byte stream with charset decoding.

    Example:
        async for text_chunk in text_stream.aiter_text():
            process(text_chunk)
    """

    def __init__(
        self,
        byte_stream: ByteStream,
        encoding: str = "utf-8",
    ) -> None:
        self._byte_stream = byte_stream
        self._encoding = encoding
        self._decoder: codecs.IncrementalDecoder | None = None

    async def aiter_text(
        self, chunk_size: int | None = None
    ) -> AsyncIterator[str]:
        """
        Iterate over response as decoded text.

        Handles multi-byte characters that span chunk boundaries.

        Args:
            chunk_size: Maximum chunk size in bytes before decoding

        Yields:
            Text chunks
        """
        # Create incremental decoder to handle multi-byte chars
        self._decoder = codecs.getincrementaldecoder(self._encoding)("replace")

        logger.debug(
            "Starting text stream",
            context={"encoding": self._encoding}
        )

        try:
            async for chunk in self._byte_stream.aiter_bytes(chunk_size):
                text = self._decoder.decode(chunk, final=False)
                if text:
                    yield text

            # Flush decoder
            text = self._decoder.decode(b"", final=True)
            if text:
                yield text

        except Exception as e:
            logger.error("Text stream error", context={"error": str(e)})
            raise

    async def aiter_lines(self) -> AsyncIterator[str]:
        """
        Iterate over response lines.

        Handles line endings: \\n, \\r\\n, \\r

        Yields:
            Complete lines (without line ending)
        """
        buffer = ""

        logger.debug("Starting line stream")

        async for text in self.aiter_text():
            buffer += text

            while True:
                # Find line ending
                newline_idx = -1
                for ending in ("\r\n", "\n", "\r"):
                    idx = buffer.find(ending)
                    if idx >= 0:
                        if newline_idx < 0 or idx < newline_idx:
                            newline_idx = idx
                            ending_len = len(ending)

                if newline_idx < 0:
                    break

                line = buffer[:newline_idx]
                buffer = buffer[newline_idx + ending_len:]
                yield line

        # Yield remaining content if no final newline
        if buffer:
            yield buffer

    async def aread(self) -> str:
        """Read entire stream as text."""
        chunks = []
        async for chunk in self.aiter_text():
            chunks.append(chunk)
        return "".join(chunks)


# =============================================================================
# Streaming Response Mixin
# =============================================================================

class StreamingResponseMixin:
    """
    Mixin to add streaming capabilities to Response class.

    Provides aiter_bytes, aiter_text, aiter_lines methods.
    """

    _byte_stream: ByteStream | None = None
    _encoding: str = "utf-8"

    def set_stream(
        self,
        stream: AsyncIterator[bytes],
        content_length: int | None = None,
        encoding: str = "utf-8",
    ) -> None:
        """Set the underlying stream."""
        self._byte_stream = ByteStream(stream, content_length=content_length)
        self._encoding = encoding

    @property
    def is_stream_consumed(self) -> bool:
        """True if the response stream has been consumed."""
        if self._byte_stream is None:
            return True
        return self._byte_stream.is_consumed

    async def aiter_bytes(
        self, chunk_size: int | None = None
    ) -> AsyncIterator[bytes]:
        """Iterate over response bytes."""
        if self._byte_stream is None:
            raise ResponseNotRead()

        async for chunk in self._byte_stream.aiter_bytes(chunk_size):
            yield chunk

    async def aiter_text(
        self, chunk_size: int | None = None
    ) -> AsyncIterator[str]:
        """Iterate over response as decoded text."""
        if self._byte_stream is None:
            raise ResponseNotRead()

        text_stream = TextStream(self._byte_stream, self._encoding)
        async for text in text_stream.aiter_text(chunk_size):
            yield text

    async def aiter_lines(self) -> AsyncIterator[str]:
        """Iterate over response lines."""
        if self._byte_stream is None:
            raise ResponseNotRead()

        text_stream = TextStream(self._byte_stream, self._encoding)
        async for line in text_stream.aiter_lines():
            yield line

    async def aread(self) -> bytes:
        """Read entire response body."""
        if self._byte_stream is None:
            raise ResponseNotRead()
        return await self._byte_stream.aread()

    async def aclose(self) -> None:
        """Close the response stream."""
        if self._byte_stream is not None:
            await self._byte_stream.aclose()


# =============================================================================
# Request Streaming
# =============================================================================

async def stream_request_body(
    content: AsyncIterator[bytes],
) -> AsyncIterator[bytes]:
    """
    Wrap request body iterator with logging.

    Args:
        content: Async iterator of bytes

    Yields:
        Bytes from content with progress tracking
    """
    total_bytes = 0

    logger.debug("Starting request body stream")

    try:
        async for chunk in content:
            total_bytes += len(chunk)
            yield chunk

        logger.debug(
            "Request body stream complete",
            context={"total_bytes": total_bytes}
        )

    except Exception as e:
        logger.error(
            "Request body stream error",
            context={"error": str(e), "bytes_sent": total_bytes}
        )
        raise


__all__ = [
    "StreamState",
    "ByteStream",
    "TextStream",
    "StreamingResponseMixin",
    "stream_request_body",
]
