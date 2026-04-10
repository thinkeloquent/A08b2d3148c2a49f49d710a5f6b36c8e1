package com.internal.extractimports;

import java.util.List;
import java.util.Objects;

/**
 * Represents a module and its specifiers in text-based notation.
 */
public record ExtractedImport(String moduleName, List<String> specifiers) {

    public ExtractedImport {
        Objects.requireNonNull(moduleName, "moduleName must not be null");
        Objects.requireNonNull(specifiers, "specifiers must not be null");
        specifiers = List.copyOf(specifiers);
    }

    @Override
    public String toString() {
        return "[\"" + moduleName + "\", " + specifiers + "]";
    }
}
