package extractimports

import "fmt"

// ExtractedImport represents a module and its specifiers in text-based notation.
type ExtractedImport struct {
	ModuleName string
	Specifiers []string
}

// SpecifierKind constants for specifier type prefixes.
const (
	KindDefault     = "default"
	KindNamed       = "named"
	KindNamespace   = "namespace"
	KindSideEffect  = "side-effect"
	KindExportNamed = "export-named"
	KindExportAll   = "export-all"
)

func FormatNamed(original, alias string) string {
	if alias != "" && alias != original {
		return fmt.Sprintf("named: %s as %s", original, alias)
	}
	return fmt.Sprintf("named: %s", original)
}

func FormatNamespace(name string) string {
	return fmt.Sprintf("namespace: %s", name)
}

func FormatSideEffect(name string) string {
	return fmt.Sprintf("side-effect: %s", name)
}

func FormatExportNamed(name string) string {
	return fmt.Sprintf("export-named: %s", name)
}
