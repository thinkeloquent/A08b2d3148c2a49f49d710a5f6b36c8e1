package fmt_sdk

import (
	"log/slog"
	"os"
	"path/filepath"
)

// Logger wraps slog.Logger with pre-configured fields for package and file.
type Logger struct {
	inner *slog.Logger
}

// CreateLogger creates a Logger that writes JSON to stderr with pkg and file attributes.
func CreateLogger(pkg, file string) *Logger {
	handler := slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})
	return &Logger{
		inner: slog.New(handler).With("pkg", pkg, "file", filepath.Base(file)),
	}
}

// CreateLoggerWith creates a Logger using the provided slog.Handler.
func CreateLoggerWith(pkg, file string, handler slog.Handler) *Logger {
	return &Logger{
		inner: slog.New(handler).With("pkg", pkg, "file", filepath.Base(file)),
	}
}

// Info logs at INFO level.
func (l *Logger) Info(msg string, args ...any) { l.inner.Info(msg, args...) }

// Warn logs at WARN level.
func (l *Logger) Warn(msg string, args ...any) { l.inner.Warn(msg, args...) }

// Error logs at ERROR level.
func (l *Logger) Error(msg string, args ...any) { l.inner.Error(msg, args...) }

// Debug logs at DEBUG level.
func (l *Logger) Debug(msg string, args ...any) { l.inner.Debug(msg, args...) }
