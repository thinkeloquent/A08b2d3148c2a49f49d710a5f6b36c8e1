package com.internal.extractimports;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Export Extraction Tests")
class ExportExtractionTest {

    private final ImportExtractor extractor = new ImportExtractor();

    static Stream<Arguments> exportCases() {
        return Stream.of(
            // Public class
            Arguments.of(
                "public class export",
                """
                    package test;
                    public class UserService {}
                    """,
                List.of(
                    new ExtractedImport("<self>", List.of("export-named: UserService"))
                )
            ),
            // Package-private class (not exported)
            Arguments.of(
                "package-private class not exported",
                """
                    package test;
                    class PackagePrivate {}
                    """,
                List.of()
            ),
            // Public interface
            Arguments.of(
                "public interface export",
                """
                    package test;
                    public interface Repository {}
                    """,
                List.of(
                    new ExtractedImport("<self>", List.of("export-named: Repository"))
                )
            ),
            // Public enum
            Arguments.of(
                "public enum export",
                """
                    package test;
                    public enum Status { ACTIVE, INACTIVE }
                    """,
                List.of(
                    new ExtractedImport("<self>", List.of("export-named: Status"))
                )
            ),
            // Public record
            Arguments.of(
                "public record export",
                """
                    package test;
                    public record UserDTO(String name) {}
                    """,
                List.of(
                    new ExtractedImport("<self>", List.of("export-named: UserDTO"))
                )
            ),
            // Mixed public and package-private - only public exported
            Arguments.of(
                "mixed public and package-private",
                """
                    package test;
                    public class PublicService {}
                    class InternalHelper {}
                    public interface PublicApi {}
                    class AnotherInternal {}
                    """,
                List.of(
                    new ExtractedImport("<self>", List.of(
                        "export-named: PublicService",
                        "export-named: PublicApi"
                    ))
                )
            )
        );
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("exportCases")
    void shouldExtractExports(String description, String code, List<ExtractedImport> expected) throws ParseException {
        List<ExtractedImport> result = extractor.extractExports(code);

        assertThat(result)
            .as(description)
            .hasSize(expected.size());

        if (!expected.isEmpty()) {
            for (int i = 0; i < expected.size(); i++) {
                assertThat(result.get(i).moduleName())
                    .as(description + " - moduleName at index " + i)
                    .isEqualTo(expected.get(i).moduleName());
                assertThat(result.get(i).specifiers())
                    .as(description + " - specifiers at index " + i)
                    .containsExactlyElementsOf(expected.get(i).specifiers());
            }
        }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("staticConvenienceExportCases")
    void shouldWorkWithStaticConvenienceMethod(String description, String code, List<ExtractedImport> expected) throws ParseException {
        List<ExtractedImport> result = ImportExtractor.extractExportsStatic(code);

        assertThat(result)
            .as(description)
            .hasSize(expected.size());

        if (!expected.isEmpty()) {
            for (int i = 0; i < expected.size(); i++) {
                assertThat(result.get(i).moduleName())
                    .isEqualTo(expected.get(i).moduleName());
                assertThat(result.get(i).specifiers())
                    .containsExactlyElementsOf(expected.get(i).specifiers());
            }
        }
    }

    static Stream<Arguments> staticConvenienceExportCases() {
        return Stream.of(
            Arguments.of(
                "static convenience - public class",
                """
                    package test;
                    public class MyService {}
                    """,
                List.of(
                    new ExtractedImport("<self>", List.of("export-named: MyService"))
                )
            )
        );
    }
}
