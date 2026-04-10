use extract_imports_text_based_notation::{extract_all, extract_exports, extract_imports};

fn main() {
    let rust_code = r#"
use std::io::{Read, Write};
use std::collections::HashMap;
use crate::errors::ExtractError;

pub fn process(input: &str) -> String {
    input.to_uppercase()
}

pub struct Config {
    pub name: String,
}

fn internal_helper() {}
"#;

    println!("=== Extracting imports ===");
    match extract_imports(rust_code) {
        Ok(imports) => {
            for (module, specifiers) in &imports {
                if specifiers.is_empty() {
                    println!("  {} (bare import)", module);
                } else {
                    println!("  {} -> {:?}", module, specifiers);
                }
            }
        }
        Err(e) => eprintln!("Error: {}", e),
    }

    println!();
    println!("=== Extracting exports ===");
    match extract_exports(rust_code) {
        Ok(exports) => {
            for (module, specifiers) in &exports {
                println!("  {} -> {:?}", module, specifiers);
            }
        }
        Err(e) => eprintln!("Error: {}", e),
    }

    println!();
    println!("=== Extracting all (imports + exports) ===");
    match extract_all(rust_code) {
        Ok((imports, exports)) => {
            println!("  Imports: {} entries", imports.len());
            println!("  Exports: {} entries", exports.len());
        }
        Err(e) => eprintln!("Error: {}", e),
    }
}
