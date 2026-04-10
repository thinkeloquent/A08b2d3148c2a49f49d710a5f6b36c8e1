use std::collections::BTreeMap;

use tree_sitter::Parser;

use crate::errors::ExtractError;

/// Extract import declarations from Java source code using tree-sitter.
///
/// Handles:
/// - `import java.util.List;` => `("java.util", ["named: List"])`
/// - `import java.util.*;` => `("java.util", ["namespace: *"])`
/// - `import static java.util.Collections.sort;` => `("java.util.Collections", ["named: sort"])`
/// - `import static java.util.Collections.*;` => `("java.util.Collections", ["namespace: *"])`
///
/// For exports: Java exports are `public` declarations (classes, interfaces, enums, etc.).
pub fn extract(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_java::LANGUAGE.into())
        .map_err(|e| ExtractError::Parse(e.to_string()))?;

    let tree = parser
        .parse(code, None)
        .ok_or_else(|| ExtractError::Parse("failed to parse Java".to_string()))?;

    let root = tree.root_node();
    let mut results: BTreeMap<String, Vec<String>> = BTreeMap::new();

    let mut cursor = root.walk();
    for child in root.children(&mut cursor) {
        if child.kind() == "import_declaration" {
            extract_import_declaration(&child, code, &mut results);
        }
    }

    Ok(results.into_iter().collect())
}

fn extract_import_declaration(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    let text = node_text(node, code);
    let is_static = has_child_with_text(node, code, "static");

    // Find the scoped_identifier or the identifier path
    // In tree-sitter-java, the import path is a scoped_identifier node.
    let mut path_text = String::new();
    let mut is_wildcard = false;

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "scoped_identifier" => {
                path_text = node_text(&child, code);
            }
            "identifier" => {
                // Could be part of the path
                if path_text.is_empty() && node_text(&child, code) != "import" {
                    path_text = node_text(&child, code);
                }
            }
            "asterisk" => {
                is_wildcard = true;
            }
            _ => {}
        }
    }

    // If there's no scoped_identifier, try to get the full path from the text
    if path_text.is_empty() {
        // Fallback: parse from text
        let cleaned = text
            .trim()
            .trim_end_matches(';')
            .trim_start_matches("import")
            .trim();
        let cleaned = if cleaned.starts_with("static") {
            cleaned.trim_start_matches("static").trim()
        } else {
            cleaned
        };
        path_text = cleaned
            .trim_end_matches(".*")
            .trim_end_matches('*')
            .trim_end_matches('.')
            .to_string();
        is_wildcard = cleaned.ends_with('*');
    }

    if path_text.is_empty() {
        return;
    }

    if is_wildcard {
        // `import java.util.*` => module="java.util", spec="namespace: *"
        // The path_text might be the parent already, or might include the wildcard parent.
        // tree-sitter scoped_identifier for `java.util.*` is `java.util`
        results
            .entry(path_text)
            .or_default()
            .push("namespace: *".to_string());
    } else {
        // `import java.util.List` => module="java.util", spec="named: List"
        // Split at the last dot
        if let Some(pos) = path_text.rfind('.') {
            let module = &path_text[..pos];
            let name = &path_text[pos + 1..];
            let spec = if is_static {
                format!("named: {} (static)", name)
            } else {
                format!("named: {}", name)
            };
            results.entry(module.to_string()).or_default().push(spec);
        } else {
            // No dot — just a single identifier
            results.entry(path_text).or_default();
        }
    }
}

fn has_child_with_text(node: &tree_sitter::Node, code: &str, text: &str) -> bool {
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        if node_text(&child, code) == text {
            return true;
        }
    }
    false
}

fn node_text(node: &tree_sitter::Node, code: &str) -> String {
    code[node.byte_range()].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_import() {
        let code = "import java.util.List;";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "java.util".to_string(),
                vec!["named: List".to_string()]
            )]
        );
    }

    #[test]
    fn test_wildcard_import() {
        let code = "import java.util.*;";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "java.util".to_string(),
                vec!["namespace: *".to_string()]
            )]
        );
    }

    #[test]
    fn test_static_import() {
        let code = "import static java.util.Collections.sort;";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "java.util.Collections".to_string(),
                vec!["named: sort (static)".to_string()]
            )]
        );
    }

    #[test]
    fn test_multiple_imports() {
        let code = r#"
import java.util.List;
import java.util.Map;
import java.io.File;
"#;
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![
                (
                    "java.io".to_string(),
                    vec!["named: File".to_string()]
                ),
                (
                    "java.util".to_string(),
                    vec!["named: List".to_string(), "named: Map".to_string()]
                ),
            ]
        );
    }
}
