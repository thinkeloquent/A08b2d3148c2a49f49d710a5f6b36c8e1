mod go_lang;
mod java_lang;
mod javascript;
mod python;
mod rust_lang;

use crate::errors::ExtractError;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Language {
    JavaScript,
    TypeScript,
    Python,
    Go,
    Rust,
    Java,
}

impl Language {
    /// Detect language from a file extension string (without the leading dot).
    pub fn from_extension(ext: &str) -> Option<Self> {
        match ext {
            "js" | "jsx" | "mjs" | "cjs" => Some(Self::JavaScript),
            "ts" | "tsx" | "mts" | "cts" => Some(Self::TypeScript),
            "py" | "pyi" => Some(Self::Python),
            "go" => Some(Self::Go),
            "rs" => Some(Self::Rust),
            "java" => Some(Self::Java),
            _ => None,
        }
    }
}

/// Extract imports from source code using tree-sitter for the given language.
pub fn extract_universal(
    code: &str,
    language: Language,
) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    match language {
        Language::JavaScript | Language::TypeScript => javascript::extract(code),
        Language::Python => python::extract(code),
        Language::Go => go_lang::extract(code),
        Language::Rust => rust_lang::extract(code),
        Language::Java => java_lang::extract(code),
    }
}
