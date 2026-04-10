use std::collections::BTreeMap;

use tree_sitter::Parser;

use crate::errors::ExtractError;

/// Extract import/export declarations from Python source code using tree-sitter.
///
/// Handles:
/// - `import module` => `("module", [])`
/// - `import module as alias` => `("module", ["named: module as alias"])`
/// - `from module import name` => `("module", ["named: name"])`
/// - `from module import name as alias` => `("module", ["named: name as alias"])`
/// - `from module import *` => `("module", ["namespace: *"])`
/// - `from .relative import name` => `(".relative", ["named: name"])`
///
/// For exports: look for `__all__` assignment and top-level function/class defs.
pub fn extract(code: &str) -> Result<Vec<(String, Vec<String>)>, ExtractError> {
    let mut parser = Parser::new();
    parser
        .set_language(&tree_sitter_python::LANGUAGE.into())
        .map_err(|e| ExtractError::Parse(e.to_string()))?;

    let tree = parser
        .parse(code, None)
        .ok_or_else(|| ExtractError::Parse("failed to parse Python".to_string()))?;

    let root = tree.root_node();
    let mut results: BTreeMap<String, Vec<String>> = BTreeMap::new();

    let mut cursor = root.walk();
    for child in root.children(&mut cursor) {
        match child.kind() {
            "import_statement" => {
                extract_import_statement(&child, code, &mut results);
            }
            "import_from_statement" => {
                extract_import_from_statement(&child, code, &mut results);
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
    // `import module` or `import module as alias` or `import a, b`
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        match child.kind() {
            "dotted_name" => {
                let module = node_text(&child, code);
                results.entry(module).or_default();
            }
            "aliased_import" => {
                // `import module as alias`
                let mut inner_cursor = child.walk();
                let children: Vec<_> = child.children(&mut inner_cursor).collect();

                let mut name = None;
                let mut alias = None;

                for (i, c) in children.iter().enumerate() {
                    match c.kind() {
                        "dotted_name" if name.is_none() => {
                            name = Some(node_text(c, code));
                        }
                        "identifier" => {
                            // The alias identifier comes after "as"
                            if i > 0
                                && children
                                    .get(i - 1)
                                    .map_or(false, |prev| node_text(prev, code) == "as")
                            {
                                alias = Some(node_text(c, code));
                            }
                        }
                        _ => {}
                    }
                }

                if let Some(module) = name {
                    let spec = match alias {
                        Some(a) => {
                            // Extract the last component of the dotted name for the specifier
                            let short_name = module.rsplit('.').next().unwrap_or(&module);
                            format!("named: {} as {}", short_name, a)
                        }
                        None => String::new(),
                    };
                    let entry = results.entry(module).or_default();
                    if !spec.is_empty() {
                        entry.push(spec);
                    }
                }
            }
            _ => {}
        }
    }
}

fn extract_import_from_statement(
    node: &tree_sitter::Node,
    code: &str,
    results: &mut BTreeMap<String, Vec<String>>,
) {
    // `from module import name` / `from module import name as alias` / `from module import *`
    let mut module_name = String::new();
    let mut specifiers = Vec::new();

    // First, find the module name.
    // The module can be a `dotted_name`, `relative_import`, or just dots for relative imports.
    let mut cursor = node.walk();
    let children: Vec<_> = node.children(&mut cursor).collect();

    let mut found_from = false;
    let mut found_import = false;

    for child in &children {
        let kind = child.kind();
        let text = node_text(child, code);

        if text == "from" {
            found_from = true;
            continue;
        }
        if text == "import" {
            found_import = true;
            continue;
        }

        if found_from && !found_import {
            // This is the module part
            match kind {
                "dotted_name" => {
                    module_name = text;
                }
                "relative_import" => {
                    module_name = text;
                }
                _ => {
                    // Could be dots for relative imports like `from . import x`
                    if kind == "import_prefix" || text.chars().all(|c| c == '.') {
                        module_name = text;
                    }
                }
            }
        } else if found_import {
            // These are the imported names
            match kind {
                "dotted_name" | "identifier" => {
                    specifiers.push(format!("named: {}", text));
                }
                "aliased_import" => {
                    let (name, alias) = extract_aliased_import(child, code);
                    match alias {
                        Some(a) => specifiers.push(format!("named: {} as {}", name, a)),
                        None => specifiers.push(format!("named: {}", name)),
                    }
                }
                "wildcard_import" => {
                    specifiers.push("namespace: *".to_string());
                }
                _ => {}
            }
        }
    }

    if !module_name.is_empty() {
        let entry = results.entry(module_name).or_default();
        entry.extend(specifiers);
    }
}

fn extract_aliased_import(node: &tree_sitter::Node, code: &str) -> (String, Option<String>) {
    let mut name = String::new();
    let mut alias = None;

    let mut cursor = node.walk();
    let children: Vec<_> = node.children(&mut cursor).collect();

    for (i, child) in children.iter().enumerate() {
        match child.kind() {
            "dotted_name" | "identifier" if name.is_empty() => {
                name = node_text(child, code);
            }
            "identifier" => {
                // Alias comes after "as" keyword
                if i > 0
                    && children
                        .get(i - 1)
                        .map_or(false, |prev| node_text(prev, code) == "as")
                {
                    alias = Some(node_text(child, code));
                }
            }
            _ => {}
        }
    }

    (name, alias)
}

fn node_text(node: &tree_sitter::Node, code: &str) -> String {
    code[node.byte_range()].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_import() {
        let code = "import os";
        let result = extract(code).unwrap();
        assert_eq!(result, vec![("os".to_string(), vec![])]);
    }

    #[test]
    fn test_from_import() {
        let code = "from os import path";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("os".to_string(), vec!["named: path".to_string()])]
        );
    }

    #[test]
    fn test_from_import_multiple() {
        let code = "from os.path import join, exists";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "os.path".to_string(),
                vec!["named: join".to_string(), "named: exists".to_string()]
            )]
        );
    }

    #[test]
    fn test_wildcard_import() {
        let code = "from os.path import *";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![("os.path".to_string(), vec!["namespace: *".to_string()])]
        );
    }

    #[test]
    fn test_aliased_from_import() {
        let code = "from collections import OrderedDict as OD";
        let result = extract(code).unwrap();
        assert_eq!(
            result,
            vec![(
                "collections".to_string(),
                vec!["named: OrderedDict as OD".to_string()]
            )]
        );
    }
}
