package com.internal.extractimports;

public enum SpecifierKind {
    DEFAULT("default"),
    NAMED("named"),
    NAMESPACE("namespace"),
    SIDE_EFFECT("side-effect"),
    EXPORT_DEFAULT("export-default"),
    EXPORT_NAMED("export-named"),
    EXPORT_ALL("export-all"),
    EXPORT_NAMESPACE("export-namespace");

    private final String prefix;

    SpecifierKind(String prefix) {
        this.prefix = prefix;
    }

    public String prefix() {
        return prefix;
    }

    @Override
    public String toString() {
        return prefix;
    }
}
