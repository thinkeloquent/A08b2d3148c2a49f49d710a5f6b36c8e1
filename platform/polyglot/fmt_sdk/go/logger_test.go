package fmt_sdk

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateLoggerReturnsNonNil(t *testing.T) {
	logger := CreateLogger("fmt_sdk", "/some/path/schemas.go")
	assert.NotNil(t, logger)
	assert.NotNil(t, logger.inner)
}

func TestCreateLoggerWithCustomHandler(t *testing.T) {
	var buf bytes.Buffer
	handler := slog.NewJSONHandler(&buf, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})

	logger := CreateLoggerWith("fmt_sdk", "/some/path/config.go", handler)
	require.NotNil(t, logger)

	logger.Info("test message", "key", "value")

	// Verify JSON output contains expected fields
	var entry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &entry)
	require.NoError(t, err)

	assert.Equal(t, "test message", entry["msg"])
	assert.Equal(t, "INFO", entry["level"])
	assert.Equal(t, "fmt_sdk", entry["pkg"])
	assert.Equal(t, "config.go", entry["file"])
	assert.Equal(t, "value", entry["key"])
}

func TestLoggerMethodsDoNotPanic(t *testing.T) {
	var buf bytes.Buffer
	handler := slog.NewJSONHandler(&buf, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})
	logger := CreateLoggerWith("test_pkg", "/path/to/file.go", handler)

	assert.NotPanics(t, func() { logger.Debug("debug message") })
	assert.NotPanics(t, func() { logger.Info("info message") })
	assert.NotPanics(t, func() { logger.Warn("warn message") })
	assert.NotPanics(t, func() { logger.Error("error message") })
}

func TestLoggerFileBaseName(t *testing.T) {
	var buf bytes.Buffer
	handler := slog.NewJSONHandler(&buf, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})

	logger := CreateLoggerWith("pkg", "/deeply/nested/path/to/module.go", handler)
	logger.Info("check basename")

	var entry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &entry)
	require.NoError(t, err)

	// Only the base filename should appear, not the full path
	assert.Equal(t, "module.go", entry["file"])
}
