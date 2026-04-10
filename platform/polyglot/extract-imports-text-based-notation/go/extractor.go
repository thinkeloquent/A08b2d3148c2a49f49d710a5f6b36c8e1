package extractimports

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log/slog"
	"strings"
	"unicode"
)

// Option configures an ImportExtractor.
type Option func(*ImportExtractor)

// WithLogger sets a custom logger.
func WithLogger(logger *slog.Logger) Option {
	return func(e *ImportExtractor) { e.logger = logger }
}

// WithFormatter sets a custom formatter.
func WithFormatter(f Formatter) Option {
	return func(e *ImportExtractor) { e.formatter = f }
}

// ImportExtractor parses Go source code to extract imports and exports.
type ImportExtractor struct {
	logger    *slog.Logger
	formatter Formatter
}

// NewImportExtractor creates a new ImportExtractor with the given options.
func NewImportExtractor(opts ...Option) *ImportExtractor {
	e := &ImportExtractor{
		logger:    NewLogger("extract-imports-text-based-notation", "extractor.go"),
		formatter: DefaultFormatter{},
	}
	for _, opt := range opts {
		opt(e)
	}
	return e
}

// ExtractImports parses Go source code and returns extracted import information.
func (e *ImportExtractor) ExtractImports(code string) ([]ExtractedImport, error) {
	e.logger.Debug("parsing Go source for imports", "codeLen", len(code))

	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, "", code, parser.ImportsOnly)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", ErrParse, err.Error())
	}

	var results []ExtractedImport

	for _, imp := range file.Imports {
		// Strip quotes from path
		path := strings.Trim(imp.Path.Value, `"`)
		// Extract last segment for original package name
		lastSegment := path
		if idx := strings.LastIndex(path, "/"); idx >= 0 {
			lastSegment = path[idx+1:]
		}

		var specs []string
		if imp.Name == nil {
			// Basic import: import "fmt" -> ["fmt", []]
			specs = []string{}
		} else {
			switch imp.Name.Name {
			case ".":
				// Dot import: import . "fmt" -> ["fmt", ["namespace: ."]]
				specs = []string{FormatNamespace(".")}
			case "_":
				// Blank import: import _ "fmt" -> ["fmt", ["side-effect: _"]]
				specs = []string{FormatSideEffect("_")}
			default:
				// Aliased: import f "fmt" -> ["fmt", ["named: fmt as f"]]
				specs = []string{FormatNamed(lastSegment, imp.Name.Name)}
			}
		}

		results = append(results, ExtractedImport{
			ModuleName: path,
			Specifiers: specs,
		})
	}

	e.logger.Info("extracted imports", "count", len(results))
	return e.formatter.Format(results), nil
}

// ExtractExports parses Go source code and returns exported declarations.
func (e *ImportExtractor) ExtractExports(code string) ([]ExtractedImport, error) {
	e.logger.Debug("parsing Go source for exports", "codeLen", len(code))

	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, "", code, parser.AllErrors)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", ErrParse, err.Error())
	}

	var specs []string

	for _, decl := range file.Decls {
		switch d := decl.(type) {
		case *ast.FuncDecl:
			if d.Name.IsExported() {
				specs = append(specs, FormatExportNamed(d.Name.Name))
			}
		case *ast.GenDecl:
			switch d.Tok {
			case token.TYPE:
				for _, spec := range d.Specs {
					ts := spec.(*ast.TypeSpec)
					if ts.Name.IsExported() {
						specs = append(specs, FormatExportNamed(ts.Name.Name))
					}
				}
			case token.CONST, token.VAR:
				for _, spec := range d.Specs {
					vs := spec.(*ast.ValueSpec)
					for _, name := range vs.Names {
						if name.IsExported() {
							specs = append(specs, FormatExportNamed(name.Name))
						}
					}
				}
			}
		}
	}

	if len(specs) == 0 {
		return []ExtractedImport{}, nil
	}

	e.logger.Info("extracted exports", "count", len(specs))
	return e.formatter.Format([]ExtractedImport{
		{ModuleName: "<self>", Specifiers: specs},
	}), nil
}

// ExtractAll parses Go source code and returns both imports and exports.
func (e *ImportExtractor) ExtractAll(code string) (imports []ExtractedImport, exports []ExtractedImport, err error) {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, "", code, parser.AllErrors)
	if err != nil {
		return nil, nil, fmt.Errorf("%w: %s", ErrParse, err.Error())
	}
	_ = file
	// For full parse, just delegate
	imports, err = e.ExtractImports(code)
	if err != nil {
		return nil, nil, err
	}
	exports, err = e.ExtractExports(code)
	if err != nil {
		return nil, nil, err
	}
	return imports, exports, nil
}

// ExtractImports is a convenience function.
func ExtractImportsFromCode(code string) ([]ExtractedImport, error) {
	return NewImportExtractor().ExtractImports(code)
}

// ExtractExports is a convenience function.
func ExtractExportsFromCode(code string) ([]ExtractedImport, error) {
	return NewImportExtractor().ExtractExports(code)
}

// isExported checks if a name starts with an uppercase letter.
func isExported(name string) bool {
	if name == "" {
		return false
	}
	return unicode.IsUpper(rune(name[0]))
}
