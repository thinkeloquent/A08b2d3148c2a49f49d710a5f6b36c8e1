pub mod errors;
pub mod extractor;
pub mod logger;
pub mod specifier;

#[cfg(feature = "universal")]
pub mod languages;

pub use errors::ExtractError;
pub use extractor::{DefaultFormatter, Formatter, ImportExtractor};
pub use specifier::SpecifierKind;

/// Extract import declarations from Rust source code.
///
/// Convenience wrapper around `ImportExtractor::extract_imports`.
pub fn extract_imports(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    ImportExtractor::new().extract_imports(code)
}

/// Extract export declarations from Rust source code.
///
/// Convenience wrapper around `ImportExtractor::extract_exports`.
pub fn extract_exports(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    ImportExtractor::new().extract_exports(code)
}

/// Extract both imports and exports from Rust source code.
pub fn extract_all(
    code: &str,
) -> Result<(Vec<(String, Vec<String>)>, Vec<(String, Vec<String>)>), ExtractError> {
    let extractor = ImportExtractor::new();
    let imports = extractor.extract_imports(code)?;
    let exports = extractor.extract_exports(code)?;
    Ok((imports, exports))
}

#[cfg(feature = "universal")]
pub use languages::Language;

/// Extract imports from source code in any supported language using tree-sitter.
#[cfg(feature = "universal")]
pub fn extract_universal(
    code: &str,
    language: Language,
) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    languages::extract_universal(code, language)
}
