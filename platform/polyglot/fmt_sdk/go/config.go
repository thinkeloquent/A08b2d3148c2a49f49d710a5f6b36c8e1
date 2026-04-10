package fmt_sdk

import (
	"github.com/BurntSushi/toml"
)

// FormatterEntry represents a single formatter configuration.
type FormatterEntry struct {
	Command    string   `toml:"command"`
	Args       []string `toml:"args"`
	Extensions []string `toml:"extensions"`
	Includes   []string `toml:"includes"`
	Excludes   []string `toml:"excludes"`
}

// FmtSdkConfig represents the top-level TOML configuration.
type FmtSdkConfig struct {
	Formatter map[string]FormatterEntry `toml:"formatter"`
}

// LoadConfig reads and parses a TOML configuration file from the given path.
func LoadConfig(path string) (*FmtSdkConfig, error) {
	var config FmtSdkConfig
	if _, err := toml.DecodeFile(path, &config); err != nil {
		return nil, err
	}
	return &config, nil
}
