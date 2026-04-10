package main

import (
	"fmt"
	"log"

	extractimports "github.com/internal/extract_imports_text_based_notation"
)

func main() {
	code := `package main

import (
	"fmt"
	"os"
	f "path/filepath"
	_ "net/http/pprof"
	. "strings"
)

const MaxRetries = 3

var ErrNotFound = fmt.Errorf("not found")

type Config struct {
	Name string
}

func Hello() {
	fmt.Println("hello")
}

func helper() {}
`

	extractor := extractimports.NewImportExtractor()

	// Extract imports
	imports, err := extractor.ExtractImports(code)
	if err != nil {
		log.Fatalf("error extracting imports: %v", err)
	}

	fmt.Println("=== Imports ===")
	for _, imp := range imports {
		fmt.Printf("  Module: %s\n", imp.ModuleName)
		if len(imp.Specifiers) > 0 {
			for _, spec := range imp.Specifiers {
				fmt.Printf("    - %s\n", spec)
			}
		} else {
			fmt.Println("    (no specifiers)")
		}
	}

	// Extract exports
	exports, err := extractor.ExtractExports(code)
	if err != nil {
		log.Fatalf("error extracting exports: %v", err)
	}

	fmt.Println("\n=== Exports ===")
	for _, exp := range exports {
		fmt.Printf("  Module: %s\n", exp.ModuleName)
		for _, spec := range exp.Specifiers {
			fmt.Printf("    - %s\n", spec)
		}
	}

	// Extract all at once
	fmt.Println("\n=== Extract All ===")
	allImports, allExports, err := extractor.ExtractAll(code)
	if err != nil {
		log.Fatalf("error extracting all: %v", err)
	}
	fmt.Printf("  Found %d import entries and %d export entries\n", len(allImports), len(allExports))
}
