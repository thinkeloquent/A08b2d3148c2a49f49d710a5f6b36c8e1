use std::collections::BTreeMap;

use tree_sitter::Parser;

use crate::errors::ExtractError;

/// Extract import/export declarations from JavaScript/TypeScript source code
/// using tree-sitter.
///
/// Handles:
/// - `import defaultExport from 'module';`
/// - `import { name1, name2 as alias } from 'module';`
/// - `import * as ns from 'module';`
/// - `import 'module';` (side-effect)
/// - `export default ...`
/// - `export { name1, name2 };`
/// - `export function name() {}` / `export class Name {}`
/// - `export * from 'module';`
pub fn extract(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_javascript::LANGUAGE.into())
        .map_err(|e| ExtractError::Parse(e.to_string()))?;

    let tree = parser
        .parse(code, None)
        .ok_or_else(|| ExtractError::Parse("failed to parse JavaScript/TypeScript".to_string()))?;

    let root = tree.root_node();
    let mut results: BTreeMap<String, Vec<String>> = BTreeMap::new();

    let mut cursor = root.walk();
    for child in root.children(&mut cursor) {
        match child.kind() {
            "import_statement" => {
                extract_import_statement(&child, code, &mut results);
            }
            "export_statement" => {
                extract_export_statement(&child, code, &mut results);
            }
            _ => {}
        }
    }

    Ok(results.into_iter().collect())
}

fn extract_import_statement(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    // Find the source string (the module path)
    let source = match find_child_by_kind(node, "string") {
        Some(s) => strip_quotes(&node_text(&s, code)),
        None => return,
    };

    let mut specifiers = Vec::new();

    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "import_clause" => {
                extract_import_clause(&child, code, &mut specifiers);
            }
            _ => {}
        }
    }

    // If no specifiers found, it's a side-effect import
    if specifiers.is_empty() {
        // Check if there's actually an import clause or just `import 'module'`
        if find_child_by_kind(node, "import_clause").is_none() {
            specifiers.push("side-effect".to_string());
        }
    }

    let entry = results.entry(source).or_default();
    entry.extend(specifiers);
}

fn extract_import_clause(
    node: &tree_sitter::Node,
    code: &str,
    specifiers: &mut Vec<String>,
) {
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "identifier" => {
                // Default import: `import React from 'react'`
                let name = node_text(&child, code);
                specifiers.push(format!("default: {}", name));
            }
            "namespace_import" => {
                // `import * as ns from 'module'`
                if let Some(ident) = find_child_by_kind(&child, "identifier") {
                    let name = node_text(&ident, code);
                    specifiers.push(format!("namespace: {}", name));
                }
            }
            "named_imports" => {
                // `import { a, b as c } from 'module'`
                let mut inner_cursor = child.walk();
                for spec in child.children(&mut inner_cursor) {
                    if spec.kind() == "import_specifier" {
                        let names = extract_specifier_names(&spec, code);
                        match names {
                            (name, Some(alias)) if alias != name => {
                                specifiers.push(format!("named: {} as {}", name, alias));
                            }
                            (name, _) => {
                                specifiers.push(format!("named: {}", name));
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

fn extract_export_statement(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    let node_src = node_text(node, code);

    // Check for `export * from 'module'`
    if let Some(source) = find_child_by_kind(node, "string") {
        let module = strip_quotes(&node_text(&source, code));

        // Re-export: `export { ... } from 'module'` or `export * from 'module'`
        let mut specifiers = Vec::new();

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            match child.kind() {
                "export_clause" => {
                    let mut inner_cursor = child.walk();
                    for spec in child.children(&mut inner_cursor) {
                        if spec.kind() == "export_specifier" {
                            let names = extract_specifier_names(&spec, code);
                            match names {
                                (name, Some(alias)) if alias != name => {
                                    specifiers
                                        .push(format!("export-named: {} as {}", name, alias));
                                }
                                (name, _) => {
                                    specifiers.push(format!("export-named: {}", name));
                                }
                            }
                        }
                    }
                }
                "namespace_export" => {
                    // `export * as ns from 'module'`
                    if let Some(ident) = find_child_by_kind(&child, "identifier") {
                        let name = node_text(&ident, code);
                        specifiers.push(format!("export-namespace: {}", name));
                    }
                }
                _ => {}
            }
        }

        // `export * from 'module'` — no export_clause or namespace_export
        if specifiers.is_empty() && node_src.contains('*') {
            specifiers.push("export-all".to_string());
        }

        let entry = results.entry(module).or_default();
        entry.extend(specifiers);
        return;
    }

    // Local exports (no source module)
    let self_key = "self".to_string();

    // `export default ...`
    if node_src.starts_with("export default") || node_src.starts_with("export\ndefault") {
        let mut cursor = node.walk();
        let has_default = node.children(&mut cursor).any(|c| {
            c.kind() == "identifier" && node_text(&c, code) == "default"
                || c.kind() == "export_default_declaration"
        });
        // For tree-sitter-javascript the "default" keyword may be embedded differently,
        // so we also check the raw text.
        if node_src.contains("default") {
            results
                .entry(self_key.clone())
                .or_default()
                .push("export-default".to_string());
        }
        let _ = has_default;
        return;
    }

    // `export function name() {}`, `export class Name {}`, `export const x = ...`
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "function_declaration" | "generator_function_declaration" => {
                if let Some(ident) = find_child_by_kind(&child, "identifier") {
                    results
                        .entry(self_key.clone())
                        .or_default()
                        .push(format!("export-named: {}", node_text(&ident, code)));
                }
            }
            "class_declaration" => {
                if let Some(ident) = find_child_by_kind(&child, "identifier") {
                    results
                        .entry(self_key.clone())
                        .or_default()
                        .push(format!("export-named: {}", node_text(&ident, code)));
                }
            }
            "lexical_declaration" => {
                // `export const a = 1, b = 2;`
                let mut inner_cursor = child.walk();
                for decl in child.children(&mut inner_cursor) {
                    if decl.kind() == "variable_declarator" {
                        if let Some(ident) = find_child_by_kind(&decl, "identifier") {
                            results
                                .entry(self_key.clone())
                                .or_default()
                                .push(format!("export-named: {}", node_text(&ident, code)));
                        }
                    }
                }
            }
            "export_clause" => {
                // `export { a, b as c }`
                let mut inner_cursor = child.walk();
                for spec in child.children(&mut inner_cursor) {
                    if spec.kind() == "export_specifier" {
                        let names = extract_specifier_names(&spec, code);
                        match names {
                            (name, Some(alias)) if alias != name => {
                                results
                                    .entry(self_key.clone())
                                    .or_default()
                                    .push(format!("export-named: {} as {}", name, alias));
                            }
                            (name, _) => {
                                results
                                    .entry(self_key.clone())
                                    .or_default()
                                    .push(format!("export-named: {}", name));
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }
}

/// Extract (name, optional alias) from an import_specifier or export_specifier node.
///
/// For `import_specifier`: the first `identifier` is the name, if there's an `as`
/// keyword followed by another `identifier`, that's the alias.
fn extract_specifier_names(node: &tree_sitter::Node, code: &str) -> (String, Option<String>) {
    let mut identifiers = Vec::new();
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        if child.kind() == "identifier" {
            identifiers.push(node_text(&child, code));
        }
    }
    match identifiers.len() {
        0 => ("*".to_string(), None),
        1 => (identifiers[0].clone(), None),
        _ => (identifiers[0].clone(), Some(identifiers[1].clone())),
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

fn strip_quotes(s: &str) -> String {
    let trimmed = s.trim();
    if (trimmed.starts_with('"') && trimmed.ends_with('"'))
        || (trimmed.starts_with('\'') && trimmed.ends_with('\''))
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
    fn test_default_import() {
        let code = "import React from 'react';";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("react".to_string(), vec!["default: React".to_string()])]
        );
    }

    #[test]
    fn test_named_imports() {
        let code = "import { useState, useEffect } from 'react';";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "react".to_string(),
                vec![
                    "named: useState".to_string(),
                    "named: useEffect".to_string(),
                ]
            )]
        );
    }

    #[test]
    fn test_namespace_import() {
        let code = "import * as React from 'react';";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "react".to_string(),
                vec!["namespace: React".to_string()]
            )]
        );
    }

    #[test]
    fn test_side_effect_import() {
        let code = "import 'polyfill';";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("polyfill".to_string(), vec!["side-effect".to_string()])]
        );
    }

    #[test]
    fn test_aliased_import() {
        let code = "import { Component as Comp } from 'react';";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "react".to_string(),
                vec!["named: Component as Comp".to_string()]
            )]
        );
    }
}
