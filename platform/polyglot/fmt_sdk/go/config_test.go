package fmt_sdk

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoadConfigFixture(t *testing.T) {
	cfg, err := LoadConfig("../__fixtures__/config.toml")
	require.NoError(t, err)
	require.NotNil(t, cfg)
	require.Len(t, cfg.Formatter, 4, "expected 4 formatter entries")

	t.Run("go formatter", func(t *testing.T) {
		f, ok := cfg.Formatter["go"]
		require.True(t, ok)
		assert.Equal(t, "gofmt", f.Command)
		assert.Equal(t, []string{"-w"}, f.Args)
		assert.Equal(t, []string{".go"}, f.Extensions)
		assert.Equal(t, []string{"**/*.go"}, f.Includes)
		assert.Equal(t, []string{"vendor/**"}, f.Excludes)
	})

	t.Run("python formatter", func(t *testing.T) {
		f, ok := cfg.Formatter["python"]
		require.True(t, ok)
		assert.Equal(t, "ruff", f.Command)
		assert.Equal(t, []string{"format", "--check"}, f.Args)
		assert.Equal(t, []string{".py"}, f.Extensions)
		assert.Equal(t, []string{"**/*.py"}, f.Includes)
		assert.Equal(t, []string{"__pycache__/**", ".venv/**"}, f.Excludes)
	})

	t.Run("node formatter", func(t *testing.T) {
		f, ok := cfg.Formatter["node"]
		require.True(t, ok)
		assert.Equal(t, "biome", f.Command)
		assert.Equal(t, []string{"format", "--write"}, f.Args)
		assert.Equal(t, []string{".js", ".ts", ".mjs", ".mts"}, f.Extensions)
		assert.Equal(t, []string{"src/**"}, f.Includes)
		assert.Equal(t, []string{"node_modules/**", "dist/**"}, f.Excludes)
	})

	t.Run("rust formatter", func(t *testing.T) {
		f, ok := cfg.Formatter["rust"]
		require.True(t, ok)
		assert.Equal(t, "rustfmt", f.Command)
		assert.Equal(t, []string{"--edition", "2021"}, f.Args)
		assert.Equal(t, []string{".rs"}, f.Extensions)
		assert.Equal(t, []string{"src/**/*.rs"}, f.Includes)
		assert.Equal(t, []string{"target/**"}, f.Excludes)
	})
}

func TestLoadConfigMissingFile(t *testing.T) {
	cfg, err := LoadConfig("/nonexistent/path/config.toml")
	assert.Error(t, err)
	assert.Nil(t, cfg)
}
