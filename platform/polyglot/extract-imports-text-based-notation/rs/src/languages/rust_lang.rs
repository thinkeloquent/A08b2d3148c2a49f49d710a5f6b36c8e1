use std::collections::BTreeMap;

use tree_sitter::Parser;

use crate::errors::ExtractError;

/// Extract import declarations from Rust source code using tree-sitter.
///
/// This is the tree-sitter-based alternative to the syn-based extractor.
/// It handles:
/// - `use std::io;` => `("std::io", [])`
/// - `use std::io::Read;` => `("std::io::Read", [])`
/// - `use std::io::{Read, Write};` => `("std::io", ["named: Read", "named: Write"])`
/// - `use std::io::Read as IoRead;` => `("std::io", ["named: Read as IoRead"])`
/// - `use std::io::*;` => `("std::io", ["namespace: *"])`
pub fn extract(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_rust::LANGUAGE.into())
        .map_err(|e| ExtractError::Parse(e.to_string()))?;

    let tree = parser
        .parse(code, None)
        .ok_or_else(|| ExtractError::Parse("failed to parse Rust".to_string()))?;

    let root = tree.root_node();
    let mut results: BTreeMap<String, Vec<String>> = BTreeMap::new();

    let mut cursor = root.walk();
    for child in root.children(&mut cursor) {
        if child.kind() == "use_declaration" {
            // Check if it's a pub use (re-export) — skip for import extraction
            let has_visibility = find_child_by_kind(&child, "visibility_modifier").is_some();
            if has_visibility {
                continue;
            }
            extract_use_declaration(&child, code, &mut results);
        }
    }

    Ok(results.into_iter().collect())
}

fn extract_use_declaration(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    // A use_declaration contains either:
    // - scoped_identifier (e.g., `use std::io;`)
    // - use_as_clause (e.g., `use std::io::Read as IoRead;`)
    // - use_wildcard (e.g., `use std::io::*;`)
    // - use_list (e.g., `use std::io::{Read, Write};`) — via scoped_use_list
    // - scoped_use_list (e.g., `use std::{io, collections};`)
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "scoped_identifier" => {
                // `use std::io::Read;` => bare module import
                let path = node_text(&child, code);
                results.entry(path).or_default();
            }
            "identifier" => {
                // `use std;` — single identifier import
                let name = node_text(&child, code);
                if name != "use" {
                    results.entry(name).or_default();
                }
            }
            "use_as_clause" => {
                // `use std::io::Read as IoRead;`
                extract_use_as_clause(&child, code, results);
            }
            "use_wildcard" => {
                // `use std::io::*;`
                extract_use_wildcard(&child, code, results);
            }
            "scoped_use_list" => {
                // `use std::io::{Read, Write};`
                extract_scoped_use_list(&child, code, results);
            }
            "use_list" => {
                // Top-level use list (rare but possible)
                extract_use_list(&child, code, &[], results);
            }
            _ => {}
        }
    }
}

fn extract_use_as_clause(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    // `use std::io::Read as IoRead;`
    // Children: scoped_identifier("std::io::Read"), "as", identifier("IoRead")
    let mut path_node = None;
    let mut alias_name = None;

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "scoped_identifier" | "identifier" => {
                if path_node.is_none() {
                    path_node = Some(child);
                } else {
                    alias_name = Some(node_text(&child, code));
                }
            }
            _ => {}
        }
    }

    if let Some(pn) = path_node {
        let full_path = node_text(&pn, code);
        // Split into module and name
        if let Some(pos) = full_path.rfind("::") {
            let module = &full_path[..pos];
            let name = &full_path[pos + 2..];
            let spec = match alias_name {
                Some(alias) if alias != name => format!("named: {} as {}", name, alias),
                _ => format!("named: {}", name),
            };
            results.entry(module.to_string()).or_default().push(spec);
        } else {
            // No :: separator — treat as bare import with alias
            let spec = match alias_name {
                Some(alias) => format!("named: {} as {}", full_path, alias),
                None => return,
            };
            results.entry(full_path).or_default().push(spec);
        }
    }
}

fn extract_use_wildcard(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    // `use std::io::*;`
    // Children: scoped_identifier("std::io") or identifier, "::", "*"
    let mut path = String::new();

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "scoped_identifier" | "identifier" | "self" | "crate" => {
                path = node_text(&child, code);
            }
            _ => {}
        }
    }

    if !path.is_empty() {
        results
            .entry(path)
            .or_default()
            .push("namespace: *".to_string());
    }
}

fn extract_scoped_use_list(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    // `use std::io::{Read, Write};`
    // Children: scoped_identifier | identifier ("std::io"), "::", use_list
    let mut prefix_parts = Vec::new();

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "scoped_identifier" | "identifier" | "self" | "crate" => {
                prefix_parts.push(node_text(&child, code));
            }
            "use_list" => {
                extract_use_list(&child, code, &prefix_parts, results);
            }
            _ => {}
        }
    }
}

fn extract_use_list(
    node: &tree_sitter::Node,
    code: &str,
    prefix_parts: &[String],
    results: &mut BTreeMap<String, Vec<String>>,
) {
    let module = prefix_parts.join("::");

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "identifier" | "self" => {
                // Named import: `Read` inside `{Read, Write}`
                let name = node_text(&child, code);
                results
                    .entry(module.clone())
                    .or_default()
                    .push(format!("named: {}", name));
            }
            "scoped_identifier" => {
                // Nested path inside a list: `hash_map::Entry` inside
                // `{HashMap, hash_map::Entry}`
                // This is a named import from a deeper module.
                let full = node_text(&child, code);
                if let Some(pos) = full.rfind("::") {
                    let sub_module = &full[..pos];
                    let name = &full[pos + 2..];
                    let full_module = if module.is_empty() {
                        sub_module.to_string()
                    } else {
                        format!("{}::{}", module, sub_module)
                    };
                    results
                        .entry(full_module)
                        .or_default()
                        .push(format!("named: {}", name));
                } else {
                    results
                        .entry(module.clone())
                        .or_default()
                        .push(format!("named: {}", full));
                }
            }
            "use_as_clause" => {
                // `Read as IoRead` inside a group
                let mut identifiers = Vec::new();
                let mut inner_cursor = child.walk();
                for inner in child.children(&mut inner_cursor) {
                    if inner.kind() == "identifier"
                        || inner.kind() == "scoped_identifier"
                        || inner.kind() == "self"
                    {
                        identifiers.push(node_text(&inner, code));
                    }
                }
                if identifiers.len() >= 2 {
                    let name = &identifiers[0];
                    let alias = &identifiers[1];
                    // Check if name contains :: (scoped)
                    if let Some(pos) = name.rfind("::") {
                        let sub_module = &name[..pos];
                        let leaf = &name[pos + 2..];
                        let full_module = if module.is_empty() {
                            sub_module.to_string()
                        } else {
                            format!("{}::{}", module, sub_module)
                        };
                        results
                            .entry(full_module)
                            .or_default()
                            .push(format!("named: {} as {}", leaf, alias));
                    } else {
                        results
                            .entry(module.clone())
                            .or_default()
                            .push(format!("named: {} as {}", name, alias));
                    }
                }
            }
            "use_wildcard" => {
                // `*` inside a group
                results
                    .entry(module.clone())
                    .or_default()
                    .push("namespace: *".to_string());
            }
            "scoped_use_list" => {
                // Nested scoped use list: `use std::{io::{Read, Write}, collections::HashMap}`
                let mut nested_prefix = prefix_parts.to_vec();
                let mut nested_cursor = child.walk();
                for nested_child in child.children(&mut nested_cursor) {
                    match nested_child.kind() {
                        "identifier" | "scoped_identifier" | "self" | "crate" => {
                            nested_prefix.push(node_text(&nested_child, code));
                        }
                        "use_list" => {
                            extract_use_list(&nested_child, code, &nested_prefix, results);
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
    }
}

fn find_child_by_kind<'a>(
    node: &'a tree_sitter::Node<'a>,
    kind: &str,
) -> Option<tree_sitter::Node<'a>> {
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        if child.kind() == kind {
            return Some(child);
        }
    }
    None
}

fn node_text(node: &tree_sitter::Node, code: &str) -> String {
    code[node.byte_range()].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bare_module() {
        let code = "use std::io;";
        let result = extract(code).unwrap();
        assert_eq!(result, vec![("std::io".to_string(), vec![])]);
    }

    #[test]
    fn test_grouped() {
        let code = "use std::io::{Read, Write};";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "std::io".to_string(),
                vec!["named: Read".to_string(), "named: Write".to_string()]
            )]
        );
    }

    #[test]
    fn test_glob() {
        let code = "use std::io::*;";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("std::io".to_string(), vec!["namespace: *".to_string()])]
        );
    }

    #[test]
    fn test_alias() {
        let code = "use std::io::Read as IoRead;";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "std::io".to_string(),
                vec!["named: Read as IoRead".to_string()]
            )]
        );
    }
}
