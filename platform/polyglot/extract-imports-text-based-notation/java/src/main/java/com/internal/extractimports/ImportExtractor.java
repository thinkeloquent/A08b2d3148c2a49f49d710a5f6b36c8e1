package com.internal.extractimports;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.ImportDeclaration;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.body.*;

import java.util.ArrayList;
import java.util.List;

public class ImportExtractor {

    private final Logger logger;

    public ImportExtractor() {
        this(Logger.create("extract-imports-text-based-notation", "ImportExtractor.java"));
    }

    public ImportExtractor(Logger logger) {
        this.logger = logger;
    }

    public List<ExtractedImport> extract(String code) throws ParseException {
        return extractImportsInternal(code);
    }

    private List<ExtractedImport> extractImportsInternal(String code) throws ParseException {
        logger.info("Parsing Java source for imports...");
        CompilationUnit cu;
        try {
            cu = StaticJavaParser.parse(code);
        } catch (com.github.javaparser.ParseProblemException e) {
            throw new ParseException("Failed to parse Java source: " + e.getMessage(), e);
        }

        List<ExtractedImport> results = new ArrayList<>();

        for (ImportDeclaration imp : cu.getImports()) {
            String qualifiedName = imp.getNameAsString();
            boolean isStatic = imp.isStatic();
            boolean isAsterisk = imp.isAsterisk();

            String moduleName;
            List<String> specifiers;

            if (!isStatic && !isAsterisk) {
                // import java.util.List; -> ["java.util", ["named: List"]]
                String[] parts = splitQualifiedName(qualifiedName);
                moduleName = parts[0];
                specifiers = List.of(SpecifierFormatter.formatNamed(parts[1]));
            } else if (!isStatic && isAsterisk) {
                // import java.util.*; -> ["java.util", ["namespace: *"]]
                moduleName = qualifiedName;
                specifiers = List.of(SpecifierFormatter.formatNamespace("*"));
            } else if (isStatic && !isAsterisk) {
                // import static java.lang.Math.PI; -> ["static java.lang.Math", ["named: PI"]]
                String[] parts = splitQualifiedName(qualifiedName);
                moduleName = "static " + parts[0];
                specifiers = List.of(SpecifierFormatter.formatNamed(parts[1]));
            } else {
                // import static java.lang.Math.*; -> ["static java.lang.Math", ["namespace: *"]]
                moduleName = "static " + qualifiedName;
                specifiers = List.of(SpecifierFormatter.formatNamespace("*"));
            }

            results.add(new ExtractedImport(moduleName, specifiers));
        }

        logger.debug("Extracted " + results.size() + " imports");
        return format(results);
    }

    public List<ExtractedImport> extractExports(String code) throws ParseException {
        logger.info("Parsing Java source for exports...");
        CompilationUnit cu;
        try {
            cu = StaticJavaParser.parse(code);
        } catch (com.github.javaparser.ParseProblemException e) {
            throw new ParseException("Failed to parse Java source: " + e.getMessage(), e);
        }

        List<String> specs = new ArrayList<>();

        for (TypeDeclaration<?> type : cu.getTypes()) {
            if (type.getModifiers().stream().anyMatch(m -> m.getKeyword() == Modifier.Keyword.PUBLIC)) {
                specs.add(SpecifierFormatter.formatExportNamed(type.getNameAsString()));
            }
        }

        if (specs.isEmpty()) {
            return List.of();
        }

        return format(List.of(new ExtractedImport("<self>", specs)));
    }

    protected List<ExtractedImport> format(List<ExtractedImport> imports) {
        return imports;
    }

    private static String[] splitQualifiedName(String qualifiedName) {
        int lastDot = qualifiedName.lastIndexOf('.');
        if (lastDot < 0) {
            return new String[]{"", qualifiedName};
        }
        return new String[]{
            qualifiedName.substring(0, lastDot),
            qualifiedName.substring(lastDot + 1)
        };
    }

    // Static convenience methods
    public static List<ExtractedImport> extractImports(String code) throws ParseException {
        return new ImportExtractor().extract(code);
    }

    public static List<ExtractedImport> extractExportsStatic(String code) throws ParseException {
        return new ImportExtractor().extractExports(code);
    }
}
