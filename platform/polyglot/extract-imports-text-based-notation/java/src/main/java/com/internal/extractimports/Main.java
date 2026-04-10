package com.internal.extractimports;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CLI entry point for extracting imports and exports from Java source code.
 *
 * <p>Usage:
 * <pre>
 *   java Main &lt;file&gt;              # extract imports from file
 *   java Main --exports &lt;file&gt;    # extract exports from file
 *   cat File.java | java Main -   # read from stdin
 * </pre>
 *
 * <p>Output is JSON array written to stdout.
 */
public class Main {

    public static void main(String[] args) {
        try {
            run(args);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }

    private static void run(String[] args) throws IOException, ParseException {
        boolean extractExports = false;
        String filePath = null;

        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--exports" -> extractExports = true;
                case "--help", "-h" -> {
                    printUsage();
                    return;
                }
                default -> filePath = args[i];
            }
        }

        String code;
        if (filePath == null || filePath.equals("-")) {
            code = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
        } else {
            code = Files.readString(Path.of(filePath), StandardCharsets.UTF_8);
        }

        ImportExtractor extractor = new ImportExtractor();
        List<ExtractedImport> results;

        if (extractExports) {
            results = extractor.extractExports(code);
        } else {
            results = extractor.extract(code);
        }

        System.out.println(toJson(results));
    }

    private static String toJson(List<ExtractedImport> imports) {
        if (imports.isEmpty()) {
            return "[]";
        }

        String entries = imports.stream()
            .map(Main::importToJson)
            .collect(Collectors.joining(",\n  "));

        return "[\n  " + entries + "\n]";
    }

    private static String importToJson(ExtractedImport imp) {
        String specifiersJson = imp.specifiers().stream()
            .map(s -> "\"" + escapeJson(s) + "\"")
            .collect(Collectors.joining(", "));

        return "[\"" + escapeJson(imp.moduleName()) + "\", [" + specifiersJson + "]]";
    }

    private static String escapeJson(String value) {
        return value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private static void printUsage() {
        System.out.println("""
            Usage: java Main [options] <file>

            Extract imports and exports from Java source code into text-based notation.

            Options:
              --exports    Extract exports instead of imports
              --help, -h   Show this help message

            Arguments:
              <file>       Path to Java source file, or '-' for stdin

            Examples:
              java Main MyClass.java
              java Main --exports MyClass.java
              cat MyClass.java | java Main -
            """);
    }
}
