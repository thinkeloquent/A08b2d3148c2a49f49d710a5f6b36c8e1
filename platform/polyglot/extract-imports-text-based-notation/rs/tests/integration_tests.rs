use extract_imports_text_based_notation::{extract_all, extract_exports, extract_imports};

// ─── Rust syn-based extractor integration tests ──────────────────────

#[test]
fn test_full_rust_file() {
    let code = r#"
use std::io::{self, Read, Write};
use std::collections::HashMap;
use crate::errors::ExtractError;

pub fn process(input: &str) -> String {
    input.to_uppercase()
}

pub struct Config {
    pub name: String,
}

fn internal_helper() {}

pub(crate) fn restricted() {}
"#;

    let (imports, exports) = extract_all(code).unwrap();

    // Check imports
    assert!(imports.iter().any(|(m, _)| m == "std::io"));
    // `use std::collections::HashMap;` resolves to bare module "std::collections::HashMap"
    assert!(imports.iter().any(|(m, _)| m == "std::collections::HashMap"));
    // `use crate::errors::ExtractError;` resolves to bare module "crate::errors::ExtractError"
    assert!(imports.iter().any(|(m, _)| m == "crate::errors::ExtractError"));

    // Check std::io specifiers include self, Read, Write
    let io_entry = imports.iter().find(|(m, _)| m == "std::io").unwrap();
    assert!(io_entry.1.contains(&"named: Read".to_string()));
    assert!(io_entry.1.contains(&"named: Write".to_string()));
    assert!(io_entry.1.contains(&"named: self".to_string()));

    // Check exports
    let self_exports = exports.iter().find(|(m, _)| m == "self").unwrap();
    assert!(self_exports.1.contains(&"export-named: process".to_string()));
    assert!(self_exports.1.contains(&"export-named: Config".to_string()));
    // private and pub(crate) should NOT be included
    assert!(!self_exports
        .1
        .contains(&"export-named: internal_helper".to_string()));
    assert!(!self_exports
        .1
        .contains(&"export-named: restricted".to_string()));
}

#[test]
fn test_empty_file() {
    let result = extract_imports("").unwrap();
    assert!(result.is_empty());

    let result = extract_exports("").unwrap();
    assert!(result.is_empty());
}

#[test]
fn test_only_comments() {
    let code = r#"
// This is a comment
/* Block comment */
"#;
    let result = extract_imports(code).unwrap();
    assert!(result.is_empty());
}

#[test]
fn test_complex_nested_use() {
    let code = r#"
use std::{
    io::{self, Read, Write, BufRead},
    collections::{HashMap, BTreeMap},
    sync::{Arc, Mutex},
};
"#;
    let result = extract_imports(code).unwrap();

    // Should have entries for std::io, std::collections, std::sync
    let io_entry = result.iter().find(|(m, _)| m == "std::io");
    assert!(io_entry.is_some());
    let io_specs = &io_entry.unwrap().1;
    assert!(io_specs.contains(&"named: self".to_string()));
    assert!(io_specs.contains(&"named: Read".to_string()));
    assert!(io_specs.contains(&"named: Write".to_string()));
    assert!(io_specs.contains(&"named: BufRead".to_string()));

    let collections_entry = result.iter().find(|(m, _)| m == "std::collections");
    assert!(collections_entry.is_some());
    let coll_specs = &collections_entry.unwrap().1;
    assert!(coll_specs.contains(&"named: HashMap".to_string()));
    assert!(coll_specs.contains(&"named: BTreeMap".to_string()));

    let sync_entry = result.iter().find(|(m, _)| m == "std::sync");
    assert!(sync_entry.is_some());
    let sync_specs = &sync_entry.unwrap().1;
    assert!(sync_specs.contains(&"named: Arc".to_string()));
    assert!(sync_specs.contains(&"named: Mutex".to_string()));
}

#[test]
fn test_pub_use_reexports_as_exports() {
    let code = r#"
pub use crate::errors::ExtractError;
pub use crate::extractor::{ImportExtractor, Formatter};
"#;
    let exports = extract_exports(code).unwrap();

    // pub use of a specific item is a re-export
    assert!(exports
        .iter()
        .any(|(m, _)| m == "crate::errors::ExtractError"));

    let extractor_entry = exports
        .iter()
        .find(|(m, _)| m == "crate::extractor");
    assert!(extractor_entry.is_some());
    let specs = &extractor_entry.unwrap().1;
    assert!(specs.contains(&"export-named: ImportExtractor".to_string()));
    assert!(specs.contains(&"export-named: Formatter".to_string()));
}

#[test]
fn test_pub_use_not_in_imports() {
    let code = r#"
pub use crate::errors::ExtractError;
use std::io::Read;
"#;
    let imports = extract_imports(code).unwrap();
    // pub use should NOT appear in imports
    assert!(!imports
        .iter()
        .any(|(m, _)| m.contains("errors")));
    // Regular use should appear
    assert!(imports
        .iter()
        .any(|(m, _)| m.contains("std::io")));
}

// ─── Universal parser integration tests (feature-gated) ─────────────

#[cfg(feature = "universal")]
mod universal {
    use extract_imports_text_based_notation::{extract_universal, Language};

    #[test]
    fn test_javascript_imports() {
        let code = r#"
import React from 'react';
import { useState, useEffect } from 'react';
import * as lodash from 'lodash';
import 'polyfill';
"#;
        let result = extract_universal(code, Language::JavaScript).unwrap();
        assert!(!result.is_empty());

        let lodash_entry = result.iter().find(|(m, _)| m == "lodash");
        assert!(lodash_entry.is_some());

        let polyfill_entry = result.iter().find(|(m, _)| m == "polyfill");
        assert!(polyfill_entry.is_some());
    }

    #[test]
    fn test_python_imports() {
        let code = r#"
import os
from os.path import join, exists
from collections import OrderedDict as OD
"#;
        let result = extract_universal(code, Language::Python).unwrap();
        assert!(!result.is_empty());
        assert!(result.iter().any(|(m, _)| m == "os"));
        assert!(result.iter().any(|(m, _)| m == "os.path"));
    }

    #[test]
    fn test_go_imports() {
        let code = r#"
package main
import (
    "fmt"
    "os"
    f "bufio"
)
"#;
        let result = extract_universal(code, Language::Go).unwrap();
        assert!(!result.is_empty());
        assert!(result.iter().any(|(m, _)| m == "fmt"));
        assert!(result.iter().any(|(m, _)| m == "os"));
        assert!(result.iter().any(|(m, _)| m == "bufio"));
    }

    #[test]
    fn test_rust_via_treesitter() {
        let code = r#"
use std::io::{Read, Write};
use std::collections::HashMap;
"#;
        let result = extract_universal(code, Language::Rust).unwrap();
        assert!(!result.is_empty());
    }

    #[test]
    fn test_java_imports() {
        let code = r#"
import java.util.List;
import java.util.Map;
import java.io.*;
"#;
        let result = extract_universal(code, Language::Java).unwrap();
        assert!(!result.is_empty());
        assert!(result.iter().any(|(m, _)| m == "java.util"));
    }

    #[test]
    fn test_language_from_extension() {
        assert_eq!(Language::from_extension("js"), Some(Language::JavaScript));
        assert_eq!(Language::from_extension("jsx"), Some(Language::JavaScript));
        assert_eq!(Language::from_extension("ts"), Some(Language::TypeScript));
        assert_eq!(Language::from_extension("tsx"), Some(Language::TypeScript));
        assert_eq!(Language::from_extension("py"), Some(Language::Python));
        assert_eq!(Language::from_extension("go"), Some(Language::Go));
        assert_eq!(Language::from_extension("rs"), Some(Language::Rust));
        assert_eq!(Language::from_extension("java"), Some(Language::Java));
        assert_eq!(Language::from_extension("unknown"), None);
    }

    #[test]
    fn test_cross_language_output_format() {
        // All languages should produce the same output format: Vec<(String, Vec<String>)>
        let js_code = "import React from 'react';";
        let py_code = "from collections import OrderedDict";
        let go_code = "package main\nimport \"fmt\"";
        let rs_code = "use std::io::Read;";
        let java_code = "import java.util.List;";

        let js_result = extract_universal(js_code, Language::JavaScript).unwrap();
        let py_result = extract_universal(py_code, Language::Python).unwrap();
        let go_result = extract_universal(go_code, Language::Go).unwrap();
        let rs_result = extract_universal(rs_code, Language::Rust).unwrap();
        let java_result = extract_universal(java_code, Language::Java).unwrap();

        // All should produce non-empty results with the same tuple structure
        assert!(!js_result.is_empty());
        assert!(!py_result.is_empty());
        assert!(!go_result.is_empty());
        assert!(!rs_result.is_empty());
        assert!(!java_result.is_empty());

        // Each result entry should be a (String, Vec<String>)
        for (module, specs) in &js_result {
            assert!(!module.is_empty());
            let _ = specs; // just verify it's a Vec<String>
        }
    }
}
