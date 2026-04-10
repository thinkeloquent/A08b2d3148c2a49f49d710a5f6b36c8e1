package examples;

import com.internal.extractimports.ExtractedImport;
import com.internal.extractimports.ImportExtractor;
import com.internal.extractimports.ParseException;

import java.util.List;

/**
 * Basic usage example demonstrating how to extract imports and exports
 * from Java source code using the ImportExtractor.
 */
public class BasicUsage {

    public static void main(String[] args) throws ParseException {

        // --- Extract Imports ---

        String sourceWithImports = """
                package com.example.app;

                import java.util.List;
                import java.util.Map;
                import java.util.*;
                import static java.lang.Math.PI;
                import static java.util.Collections.*;
                import com.example.service.impl.UserServiceImpl;

                public class Application {
                    public static void main(String[] args) {
                        System.out.println("Hello");
                    }
                }
                """;

        System.out.println("=== Import Extraction ===");
        List<ExtractedImport> imports = ImportExtractor.extractImports(sourceWithImports);
        for (ExtractedImport imp : imports) {
            System.out.println(imp);
        }

        // --- Extract Exports ---

        String sourceWithExports = """
                package com.example.model;

                public class User {
                    private String name;
                }

                class InternalHelper {
                    // package-private, not exported
                }

                public interface UserRepository {
                    User findById(long id);
                }

                public enum UserRole {
                    ADMIN, USER, GUEST
                }

                public record UserDTO(String name, String email) {}
                """;

        System.out.println();
        System.out.println("=== Export Extraction ===");
        List<ExtractedImport> exports = ImportExtractor.extractExportsStatic(sourceWithExports);
        for (ExtractedImport exp : exports) {
            System.out.println(exp);
        }

        // --- Using instance API with custom extraction ---

        System.out.println();
        System.out.println("=== Instance API ===");
        ImportExtractor extractor = new ImportExtractor();

        List<ExtractedImport> instanceImports = extractor.extract(sourceWithImports);
        System.out.println("Imports found: " + instanceImports.size());

        List<ExtractedImport> instanceExports = extractor.extractExports(sourceWithExports);
        System.out.println("Exports found: " + instanceExports.size());

        // Print all specifiers from exports
        for (ExtractedImport exp : instanceExports) {
            System.out.println("Module: " + exp.moduleName());
            for (String spec : exp.specifiers()) {
                System.out.println("  - " + spec);
            }
        }
    }
}
