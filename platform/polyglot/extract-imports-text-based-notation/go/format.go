package extractimports

// Formatter interface for extensible output formatting.
type Formatter interface {
	Format(imports []ExtractedImport) []ExtractedImport
}

// DefaultFormatter returns imports unchanged.
type DefaultFormatter struct{}

func (f DefaultFormatter) Format(imports []ExtractedImport) []ExtractedImport {
	return imports
}
