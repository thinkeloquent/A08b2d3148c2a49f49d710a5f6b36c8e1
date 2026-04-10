package com.internal.extractimports;

public final class SpecifierFormatter {

    private SpecifierFormatter() {}

    public static String formatNamed(String name) {
        return "named: " + name;
    }

    public static String formatNamespace(String name) {
        return "namespace: " + name;
    }

    public static String formatExportNamed(String name) {
        return "export-named: " + name;
    }

    public static String formatExportAll() {
        return "export-all";
    }
}
