package fmt_sdk

// Language enum constants — must match cross-language values exactly
const (
	LanguageGo     = "go"
	LanguagePython = "python"
	LanguageNode   = "node"
	LanguageRust   = "rust"
	LanguageShell  = "shell"
	LanguageSQL    = "sql"
	LanguageMarkup = "markup"
)

// ValidLanguages for validation
var ValidLanguages = []string{
	LanguageGo, LanguagePython, LanguageNode, LanguageRust,
	LanguageShell, LanguageSQL, LanguageMarkup,
}

// Severity enum constants
const (
	SeverityError   = "error"
	SeverityWarning = "warning"
	SeverityInfo    = "info"
	SeverityHint    = "hint"
)

// ValidSeverities for validation
var ValidSeverities = []string{
	SeverityError, SeverityWarning, SeverityInfo, SeverityHint,
}

// FormatRequest represents a request to format source code.
type FormatRequest struct {
	Source   string                 `json:"source"`
	Language string                 `json:"language"`
	Options  map[string]interface{} `json:"options,omitempty"`
	Context  map[string]interface{} `json:"context,omitempty"`
}

// Diagnostic represents a single diagnostic message from a formatter.
type Diagnostic struct {
	File     string `json:"file,omitempty"`
	Line     *int   `json:"line,omitempty"`
	Column   *int   `json:"column,omitempty"`
	Severity string `json:"severity"`
	Message  string `json:"message"`
	Rule     string `json:"rule,omitempty"`
}

// FormatResult represents the result of a formatting operation.
type FormatResult struct {
	Success     bool                   `json:"success"`
	Formatted   string                 `json:"formatted,omitempty"`
	Diff        string                 `json:"diff,omitempty"`
	Diagnostics []Diagnostic           `json:"diagnostics"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}
