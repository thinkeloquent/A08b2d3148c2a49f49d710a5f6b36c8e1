use std::collections::BTreeMap;

use tree_sitter::Parser;

use crate::errors::ExtractError;

/// Extract import declarations from Go source code using tree-sitter.
///
/// Handles:
/// - `import "fmt"` => `("fmt", [])`
/// - `import f "fmt"` => `("fmt", ["named: fmt as f"])`
/// - `import . "fmt"` => `("fmt", ["namespace: *"])` (dot import)
/// - `import _ "fmt"` => `("fmt", ["side-effect"])` (blank import)
/// - `import ( "fmt"; "os" )` => grouped imports
///
/// For exports: Go exports are identified by capitalized identifiers. We look for
/// top-level function, type, var, and const declarations with uppercase first letter.
pub fn extract(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_go::LANGUAGE.into())
        .map_err(|e| ExtractError::Parse(e.to_string()))?;

    let tree = parser
        .parse(code, None)
        .ok_or_else(|| ExtractError::Parse("failed to parse Go".to_string()))?;

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
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "import_spec" => {
                extract_import_spec(&child, code, results);
            }
            "import_spec_list" => {
                // Grouped imports: `import ( ... )`
                let mut inner_cursor = child.walk();
                for spec in child.children(&mut inner_cursor) {
                    if spec.kind() == "import_spec" {
                        extract_import_spec(&spec, code, results);
                    }
                }
            }
            "interpreted_string_literal" | "raw_string_literal" => {
                // Single import without alias: `import "fmt"`
                let path = strip_quotes(&node_text(&child, code));
                results.entry(path).or_default();
            }
            _ => {}
        }
    }
}

fn extract_import_spec(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    let mut alias: Option<String> = None;
    let mut path = String::new();

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "package_identifier" | "dot" | "blank_identifier" => {
                alias = Some(node_text(&child, code));
            }
            "interpreted_string_literal" | "raw_string_literal" => {
                path = strip_quotes(&node_text(&child, code));
            }
            _ => {}
        }
    }

    if path.is_empty() {
        return;
    }

    // Determine the specifier based on the alias
    let entry = results.entry(path.clone()).or_default();
    match alias.as_deref() {
        Some(".") => {
            // Dot import: equivalent to namespace import
            entry.push("namespace: *".to_string());
        }
        Some("_") => {
            // Blank import: side-effect only
            entry.push("side-effect".to_string());
        }
        Some(a) => {
            // Named alias: `import f "fmt"` => named: fmt as f
            // Extract the package name (last segment of the path)
            let pkg_name = path.rsplit('/').next().unwrap_or(&path);
            entry.push(format!("named: {} as {}", pkg_name, a));
        }
        None => {
            // No alias: bare import
        }
    }
}

fn node_text(node: &tree_sitter::Node, code: &str) -> String {
    code[node.byte_range()].to_string()
}

fn strip_quotes(s: &str) -> String {
    let trimmed = s.trim();
    if (trimmed.starts_with('"') && trimmed.ends_with('"'))
        || (trimmed.starts_with('`') && trimmed.ends_with('`'))
    {
        trimmed[1..trimmed.len() - 1].to_string()
    } else {
        trimmed.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_single_import() {
        let code = r#"
package main
import "fmt"
"#;
        let result = extract(code).unwrap();
        assert_eq!(result, vec![("fmt".to_string(), vec![])]);
    }

    #[test]
    fn test_grouped_imports() {
        let code = r#"
package main
import (
    "fmt"
    "os"
)
"#;
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![
                ("fmt".to_string(), vec![]),
                ("os".to_string(), vec![]),
            ]
        );
    }

    #[test]
    fn test_aliased_import() {
        let code = r#"
package main
import f "fmt"
"#;
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("fmt".to_string(), vec!["named: fmt as f".to_string()])]
        );
    }

    #[test]
    fn test_dot_import() {
        let code = r#"
package main
import . "fmt"
"#;
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("fmt".to_string(), vec!["namespace: *".to_string()])]
        );
    }

    #[test]
    fn test_blank_import() {
        let code = r#"
package main
import _ "database/sql"
"#;
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "database/sql".to_string(),
                vec!["side-effect".to_string()]
            )]
        );
    }
}
