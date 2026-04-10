package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"

	extractimports "github.com/internal/extract_imports_text_based_notation"
)

type output struct {
	Imports []extractimports.ExtractedImport `json:"imports,omitempty"`
	Exports []extractimports.ExtractedImport `json:"exports,omitempty"`
}

func main() {
	filePath := flag.String("file", "", "Path to Go source file (reads from stdin if not provided)")
	mode := flag.String("mode", "both", "Extraction mode: imports, exports, or both")
	flag.Parse()

	var code []byte
	var err error

	if *filePath != "" {
		code, err = os.ReadFile(*filePath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error reading file: %v\n", err)
			os.Exit(1)
		}
	} else {
		code, err = io.ReadAll(os.Stdin)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error reading stdin: %v\n", err)
			os.Exit(1)
		}
	}

	extractor := extractimports.NewImportExtractor()
	result := output{}

	switch *mode {
	case "imports":
		result.Imports, err = extractor.ExtractImports(string(code))
		if err != nil {
			fmt.Fprintf(os.Stderr, "error extracting imports: %v\n", err)
			os.Exit(1)
		}
	case "exports":
		result.Exports, err = extractor.ExtractExports(string(code))
		if err != nil {
			fmt.Fprintf(os.Stderr, "error extracting exports: %v\n", err)
			os.Exit(1)
		}
	case "both":
		result.Imports, result.Exports, err = extractor.ExtractAll(string(code))
		if err != nil {
			fmt.Fprintf(os.Stderr, "error extracting: %v\n", err)
			os.Exit(1)
		}
	default:
		fmt.Fprintf(os.Stderr, "unknown mode: %s (use imports, exports, or both)\n", *mode)
		os.Exit(1)
	}

	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	if err := enc.Encode(result); err != nil {
		fmt.Fprintf(os.Stderr, "error encoding JSON: %v\n", err)
		os.Exit(1)
	}
}
