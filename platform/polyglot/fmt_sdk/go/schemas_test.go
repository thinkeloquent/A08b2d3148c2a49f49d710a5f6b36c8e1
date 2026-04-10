package fmt_sdk

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ---------- Enum constant tests ----------

func TestLanguageConstants(t *testing.T) {
	assert.Equal(t, "go", LanguageGo)
	assert.Equal(t, "python", LanguagePython)
	assert.Equal(t, "node", LanguageNode)
	assert.Equal(t, "rust", LanguageRust)
	assert.Equal(t, "shell", LanguageShell)
	assert.Equal(t, "sql", LanguageSQL)
	assert.Equal(t, "markup", LanguageMarkup)
	assert.Len(t, ValidLanguages, 7)
}

func TestSeverityConstants(t *testing.T) {
	assert.Equal(t, "error", SeverityError)
	assert.Equal(t, "warning", SeverityWarning)
	assert.Equal(t, "info", SeverityInfo)
	assert.Equal(t, "hint", SeverityHint)
	assert.Len(t, ValidSeverities, 4)
}

// ---------- FormatRequest round-trip ----------

func TestFormatRequestRoundTrip(t *testing.T) {
	original := FormatRequest{
		Source:   "package main\n",
		Language: LanguageGo,
		Options:  map[string]interface{}{"tab_width": float64(4)},
		Context:  map[string]interface{}{"caller": "test"},
	}

	data, err := json.Marshal(original)
	require.NoError(t, err)

	var decoded FormatRequest
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, original, decoded)
}

func TestFormatRequestMinimal(t *testing.T) {
	original := FormatRequest{
		Source:   "x = 1\n",
		Language: LanguagePython,
	}

	data, err := json.Marshal(original)
	require.NoError(t, err)

	// Options and Context should be omitted from JSON when nil
	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	require.NoError(t, err)
	assert.NotContains(t, raw, "options")
	assert.NotContains(t, raw, "context")

	var decoded FormatRequest
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)
	assert.Equal(t, original, decoded)
}

// ---------- FormatResult round-trip ----------

func TestFormatResultRoundTrip(t *testing.T) {
	line := 5
	col := 10
	original := FormatResult{
		Success:   false,
		Formatted: "",
		Diagnostics: []Diagnostic{
			{
				File:     "main.go",
				Line:     &line,
				Column:   &col,
				Severity: SeverityError,
				Message:  "expected ';', found 'EOF'",
				Rule:     "syntax",
			},
		},
	}

	data, err := json.Marshal(original)
	require.NoError(t, err)

	var decoded FormatResult
	err = json.Unmarshal(data, &decoded)
	require.NoError(t, err)

	assert.Equal(t, original, decoded)
}

func TestFormatResultDiagnosticsAlwaysPresent(t *testing.T) {
	result := FormatResult{
		Success:     true,
		Formatted:   "x = 1\n",
		Diagnostics: []Diagnostic{},
	}

	data, err := json.Marshal(result)
	require.NoError(t, err)

	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	require.NoError(t, err)

	// diagnostics must be present even when empty
	assert.Contains(t, raw, "diagnostics")
	diags, ok := raw["diagnostics"].([]interface{})
	assert.True(t, ok)
	assert.Empty(t, diags)
}

// ---------- Diagnostic optional fields omitted when nil ----------

func TestDiagnosticOptionalFieldsOmitted(t *testing.T) {
	diag := Diagnostic{
		Severity: SeverityError,
		Message:  "Syntax error: unexpected token",
	}

	data, err := json.Marshal(diag)
	require.NoError(t, err)

	var raw map[string]interface{}
	err = json.Unmarshal(data, &raw)
	require.NoError(t, err)

	assert.NotContains(t, raw, "file")
	assert.NotContains(t, raw, "line")
	assert.NotContains(t, raw, "column")
	assert.NotContains(t, raw, "rule")
	assert.Contains(t, raw, "severity")
	assert.Contains(t, raw, "message")
}

// ---------- Fixture: format_request.json ----------

type formatRequestFixture struct {
	FormatRequestTests []struct {
		ID    string        `json:"id"`
		Name  string        `json:"name"`
		Input FormatRequest `json:"input"`
	} `json:"format_request_tests"`
}

func TestFormatRequestFixtures(t *testing.T) {
	data, err := os.ReadFile("../__fixtures__/format_request.json")
	require.NoError(t, err, "fixture file must be readable")

	var fixture formatRequestFixture
	err = json.Unmarshal(data, &fixture)
	require.NoError(t, err, "fixture must parse into Go structs")
	require.Len(t, fixture.FormatRequestTests, 7, "expected 7 request test cases")

	for _, tc := range fixture.FormatRequestTests {
		t.Run(tc.ID+"_"+tc.Name, func(t *testing.T) {
			// Re-serialize to JSON
			serialized, err := json.Marshal(tc.Input)
			require.NoError(t, err)

			// Unmarshal back
			var roundTripped FormatRequest
			err = json.Unmarshal(serialized, &roundTripped)
			require.NoError(t, err)

			// Deep equal
			assert.Equal(t, tc.Input, roundTripped)
		})
	}
}

// ---------- Fixture: format_result.json ----------

type formatResultFixture struct {
	FormatResultTests []struct {
		ID    string       `json:"id"`
		Name  string       `json:"name"`
		Input FormatResult `json:"input"`
	} `json:"format_result_tests"`
}

func TestFormatResultFixtures(t *testing.T) {
	data, err := os.ReadFile("../__fixtures__/format_result.json")
	require.NoError(t, err, "fixture file must be readable")

	var fixture formatResultFixture
	err = json.Unmarshal(data, &fixture)
	require.NoError(t, err, "fixture must parse into Go structs")
	require.Len(t, fixture.FormatResultTests, 5, "expected 5 result test cases")

	for _, tc := range fixture.FormatResultTests {
		t.Run(tc.ID+"_"+tc.Name, func(t *testing.T) {
			// Re-serialize to JSON
			serialized, err := json.Marshal(tc.Input)
			require.NoError(t, err)

			// Unmarshal back
			var roundTripped FormatResult
			err = json.Unmarshal(serialized, &roundTripped)
			require.NoError(t, err)

			// Deep equal
			assert.Equal(t, tc.Input, roundTripped)
		})
	}
}
