package extractimports

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestExtractImports(t *testing.T) {
	extractor := NewImportExtractor()

	tests := []struct {
		name     string
		code     string
		expected []ExtractedImport
		wantErr  bool
	}{
		{
			name: "basic import",
			code: "package main\n\nimport \"fmt\"\n",
			expected: []ExtractedImport{
				{ModuleName: "fmt", Specifiers: []string{}},
			},
		},
		{
			name: "aliased import",
			code: "package main\n\nimport f \"fmt\"\n",
			expected: []ExtractedImport{
				{ModuleName: "fmt", Specifiers: []string{"named: fmt as f"}},
			},
		},
		{
			name: "dot import",
			code: "package main\n\nimport . \"fmt\"\n",
			expected: []ExtractedImport{
				{ModuleName: "fmt", Specifiers: []string{"namespace: ."}},
			},
		},
		{
			name: "blank import",
			code: "package main\n\nimport _ \"fmt\"\n",
			expected: []ExtractedImport{
				{ModuleName: "fmt", Specifiers: []string{"side-effect: _"}},
			},
		},
		{
			name: "grouped imports",
			code: "package main\n\nimport (\n\t\"fmt\"\n\t\"os\"\n)\n",
			expected: []ExtractedImport{
				{ModuleName: "fmt", Specifiers: []string{}},
				{ModuleName: "os", Specifiers: []string{}},
			},
		},
		{
			name: "long path import",
			code: "package main\n\nimport \"github.com/user/repo/pkg\"\n",
			expected: []ExtractedImport{
				{ModuleName: "github.com/user/repo/pkg", Specifiers: []string{}},
			},
		},
		{
			name: "aliased long path import",
			code: "package main\n\nimport p \"github.com/user/repo/pkg\"\n",
			expected: []ExtractedImport{
				{ModuleName: "github.com/user/repo/pkg", Specifiers: []string{"named: pkg as p"}},
			},
		},
		{
			name:    "syntax error",
			code:    "this is not valid go code",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := extractor.ExtractImports(tt.code)
			if tt.wantErr {
				require.Error(t, err)
				assert.ErrorIs(t, err, ErrParse)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestExtractExports(t *testing.T) {
	extractor := NewImportExtractor()

	tests := []struct {
		name     string
		code     string
		expected []ExtractedImport
	}{
		{
			name: "exported function",
			code: "package main\n\nfunc Hello() {}\n",
			expected: []ExtractedImport{
				{ModuleName: "<self>", Specifiers: []string{"export-named: Hello"}},
			},
		},
		{
			name:     "unexported function",
			code:     "package main\n\nfunc hello() {}\n",
			expected: []ExtractedImport{},
		},
		{
			name: "exported type",
			code: "package main\n\ntype User struct{}\n",
			expected: []ExtractedImport{
				{ModuleName: "<self>", Specifiers: []string{"export-named: User"}},
			},
		},
		{
			name: "exported const",
			code: "package main\n\nconst MaxRetries = 3\n",
			expected: []ExtractedImport{
				{ModuleName: "<self>", Specifiers: []string{"export-named: MaxRetries"}},
			},
		},
		{
			name: "exported var",
			code: "package main\n\nimport \"errors\"\n\nvar ErrNotFound = errors.New(\"not found\")\n",
			expected: []ExtractedImport{
				{ModuleName: "<self>", Specifiers: []string{"export-named: ErrNotFound"}},
			},
		},
		{
			name: "multiple exports",
			code: "package main\n\nfunc Hello() {}\n\ntype User struct{}\n\nconst MaxRetries = 3\n",
			expected: []ExtractedImport{
				{ModuleName: "<self>", Specifiers: []string{
					"export-named: Hello",
					"export-named: User",
					"export-named: MaxRetries",
				}},
			},
		},
		{
			name:     "empty file",
			code:     "package main\n",
			expected: []ExtractedImport{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := extractor.ExtractExports(tt.code)
			require.NoError(t, err)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestExtractAll(t *testing.T) {
	extractor := NewImportExtractor()

	code := "package main\n\nimport \"fmt\"\n\nfunc Hello() {\n\tfmt.Println(\"hello\")\n}\n"

	imports, exports, err := extractor.ExtractAll(code)
	require.NoError(t, err)

	assert.Equal(t, []ExtractedImport{
		{ModuleName: "fmt", Specifiers: []string{}},
	}, imports)

	assert.Equal(t, []ExtractedImport{
		{ModuleName: "<self>", Specifiers: []string{"export-named: Hello"}},
	}, exports)
}

func TestConvenienceFunctions(t *testing.T) {
	code := "package main\n\nimport \"fmt\"\n\nfunc Hello() {}\n"

	imports, err := ExtractImportsFromCode(code)
	require.NoError(t, err)
	assert.Len(t, imports, 1)
	assert.Equal(t, "fmt", imports[0].ModuleName)

	exports, err := ExtractExportsFromCode(code)
	require.NoError(t, err)
	assert.Len(t, exports, 1)
	assert.Equal(t, "<self>", exports[0].ModuleName)
}

func TestWithOptions(t *testing.T) {
	// Test that options are applied without error
	extractor := NewImportExtractor(
		WithFormatter(DefaultFormatter{}),
	)

	result, err := extractor.ExtractImports("package main\n\nimport \"fmt\"\n")
	require.NoError(t, err)
	assert.Len(t, result, 1)
}
