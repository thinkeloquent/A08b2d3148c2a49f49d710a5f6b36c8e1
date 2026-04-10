package extractimports

import (
	"log/slog"
	"os"
)

// NewLogger creates a package-local logger with prefixed attributes.
func NewLogger(packageName, filename string) *slog.Logger {
	handler := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelWarn,
	})
	return slog.New(handler).With("pkg", packageName, "file", filename)
}
