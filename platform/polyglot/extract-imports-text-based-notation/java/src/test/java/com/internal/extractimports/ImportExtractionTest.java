package com.internal.extractimports;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Import Extraction Tests")
class ImportExtractionTest {

    private final ImportExtractor extractor = new ImportExtractor();

    static Stream<Arguments> importCases() {
        return Stream.of(
            // Single named import
            Arguments.of(
                "single named import",
                """
                    package test;
                    import java.util.List;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("java.util", List.of("named: List"))
                )
            ),
            // Wildcard import
            Arguments.of(
                "wildcard import",
                """
                    package test;
                    import java.util.*;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("java.util", List.of("namespace: *"))
                )
            ),
            // Static named import
            Arguments.of(
                "static named import",
                """
                    package test;
                    import static java.lang.Math.PI;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("static java.lang.Math", List.of("named: PI"))
                )
            ),
            // Static wildcard import
            Arguments.of(
                "static wildcard import",
                """
                    package test;
                    import static java.lang.Math.*;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("static java.lang.Math", List.of("namespace: *"))
                )
            ),
            // Multiple imports - order preserved
            Arguments.of(
                "multiple imports with order preserved",
                """
                    package test;
                    import java.util.List;
                    import java.util.Map;
                    import java.io.File;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("java.util", List.of("named: List")),
                    new ExtractedImport("java.util", List.of("named: Map")),
                    new ExtractedImport("java.io", List.of("named: File"))
                )
            ),
            // Deep package path
            Arguments.of(
                "deep package path",
                """
                    package test;
                    import com.example.service.impl.UserServiceImpl;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("com.example.service.impl", List.of("named: UserServiceImpl"))
                )
            )
        );
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("importCases")
    void shouldExtractImports(String description, String code, List<ExtractedImport> expected) throws ParseException {
        List<ExtractedImport> result = extractor.extract(code);

        assertThat(result)
            .as(description)
            .hasSize(expected.size());

        for (int i = 0; i < expected.size(); i++) {
            assertThat(result.get(i).moduleName())
                .as(description + " - moduleName at index " + i)
                .isEqualTo(expected.get(i).moduleName());
            assertThat(result.get(i).specifiers())
                .as(description + " - specifiers at index " + i)
                .containsExactlyElementsOf(expected.get(i).specifiers());
        }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("syntaxErrorCases")
    void shouldThrowParseExceptionOnSyntaxError(String description, String code) {
        assertThatThrownBy(() -> extractor.extract(code))
            .as(description)
            .isInstanceOf(ParseException.class)
            .hasMessageContaining("Failed to parse Java source");
    }

    static Stream<Arguments> syntaxErrorCases() {
        return Stream.of(
            Arguments.of(
                "syntax error - missing semicolon and class",
                "import java.util.List"
            ),
            Arguments.of(
                "syntax error - completely invalid",
                "this is not valid java code at all {"
            )
        );
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("staticConvenienceCases")
    void shouldWorkWithStaticConvenienceMethod(String description, String code, List<ExtractedImport> expected) throws ParseException {
        List<ExtractedImport> result = ImportExtractor.extractImports(code);

        assertThat(result)
            .as(description)
            .hasSize(expected.size());

        for (int i = 0; i < expected.size(); i++) {
            assertThat(result.get(i).moduleName())
                .isEqualTo(expected.get(i).moduleName());
            assertThat(result.get(i).specifiers())
                .containsExactlyElementsOf(expected.get(i).specifiers());
        }
    }

    static Stream<Arguments> staticConvenienceCases() {
        return Stream.of(
            Arguments.of(
                "static convenience - single import",
                """
                    package test;
                    import java.util.List;
                    public class Test {}
                    """,
                List.of(
                    new ExtractedImport("java.util", List.of("named: List"))
                )
            )
        );
    }
}
