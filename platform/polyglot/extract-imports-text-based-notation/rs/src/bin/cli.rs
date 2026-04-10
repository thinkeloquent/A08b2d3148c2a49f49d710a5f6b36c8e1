use std::env;
use std::fs;
use std::io::{self, Read};
use std::process;

use extract_imports_text_based_notation::{extract_all, Language};

fn main() {
    let args: Vec<String> = env::args().collect();

    let mut file_path: Option<String> = None;
    let mut language_str: Option<String> = None;
    let mut mode = "all".to_string(); // "imports", "exports", or "all"

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--file" | "-f" => {
                i += 1;
                if i < args.len() {
                    file_path = Some(args[i].clone());
                } else {
                    eprintln!("error: --file requires a value");
                    process::exit(1);
                }
            }
            "--language" | "-l" => {
                i += 1;
                if i < args.len() {
                    language_str = Some(args[i].clone());
                } else {
                    eprintln!("error: --language requires a value");
                    process::exit(1);
                }
            }
            "--mode" | "-m" => {
                i += 1;
                if i < args.len() {
                    mode = args[i].clone();
                } else {
                    eprintln!("error: --mode requires a value");
                    process::exit(1);
                }
            }
            "--help" | "-h" => {
                print_help();
                process::exit(0);
            }
            other => {
                // Treat positional arg as file path
                if file_path.is_none() {
                    file_path = Some(other.to_string());
                } else {
                    eprintln!("error: unexpected argument: {}", other);
                    process::exit(1);
                }
            }
        }
        i += 1;
    }

    // Read source code from file or stdin
    let code = match &file_path {
        Some(path) => match fs::read_to_string(path) {
            Ok(content) => content,
            Err(e) => {
                eprintln!("error: could not read file '{}': {}", path, e);
                process::exit(1);
            }
        },
        None => {
            let mut buf = String::new();
            if let Err(e) = io::stdin().read_to_string(&mut buf) {
                eprintln!("error: could not read from stdin: {}", e);
                process::exit(1);
            }
            buf
        }
    };

    // Determine language
    let language = determine_language(&file_path, &language_str);

    match language {
        Some(lang) => {
            // Use the universal tree-sitter parser
            match extract_imports_text_based_notation::extract_universal(&code, lang) {
                Ok(results) => {
                    print_json(&results, &mode);
                }
                Err(e) => {
                    eprintln!("error: {}", e);
                    process::exit(1);
                }
            }
        }
        None => {
            // Default: use Rust syn-based parser
            match extract_all(&code) {
                Ok((imports, exports)) => match mode.as_str() {
                    "imports" => print_json(&imports, &mode),
                    "exports" => print_json(&exports, &mode),
                    _ => {
                        println!("{{");
                        println!("  \"imports\": [");
                        print_entries(&imports);
                        println!("  ],");
                        println!("  \"exports\": [");
                        print_entries(&exports);
                        println!("  ]");
                        println!("}}");
                    }
                },
                Err(e) => {
                    eprintln!("error: {}", e);
                    process::exit(1);
                }
            }
        }
    }
}

fn determine_language(
    file_path: &Option<String>,
    language_str: &Option<String>,
) -> Option<Language> {
    // Explicit language flag takes precedence
    if let Some(lang) = language_str {
        return match lang.to_lowercase().as_str() {
            "javascript" | "js" => Some(Language::JavaScript),
            "typescript" | "ts" => Some(Language::TypeScript),
            "python" | "py" => Some(Language::Python),
            "go" | "golang" => Some(Language::Go),
            "rust" | "rs" => Some(Language::Rust),
            "java" => Some(Language::Java),
            _ => {
                eprintln!("warning: unknown language '{}', falling back to Rust", lang);
                None
            }
        };
    }

    // Infer from file extension
    if let Some(path) = file_path {
        if let Some(ext) = path.rsplit('.').next() {
            return Language::from_extension(ext);
        }
    }

    None
}

fn print_json(results: &[(String, Vec<String>)], _mode: &str) {
    println!("[");
    for (i, (module, specs)) in results.iter().enumerate() {
        let comma = if i + 1 < results.len() { "," } else { "" };
        if specs.is_empty() {
            println!("  [\"{}\", []]{}", escape_json(module), comma);
        } else {
            let specs_str: Vec<String> = specs.iter().map(|s| format!("\"{}\"", escape_json(s))).collect();
            println!(
                "  [\"{}\", [{}]]{}",
                escape_json(module),
                specs_str.join(", "),
                comma
            );
        }
    }
    println!("]");
}

fn print_entries(results: &[(String, Vec<String>)]) {
    for (i, (module, specs)) in results.iter().enumerate() {
        let comma = if i + 1 < results.len() { "," } else { "" };
        if specs.is_empty() {
            println!("    [\"{}\", []]{}", escape_json(module), comma);
        } else {
            let specs_str: Vec<String> = specs.iter().map(|s| format!("\"{}\"", escape_json(s))).collect();
            println!(
                "    [\"{}\", [{}]]{}",
                escape_json(module),
                specs_str.join(", "),
                comma
            );
        }
    }
}

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
        .replace('\t', "\\t")
}

fn print_help() {
    println!("extract-imports - Extract import/export declarations from source code");
    println!();
    println!("USAGE:");
    println!("  extract-imports [OPTIONS] [FILE]");
    println!();
    println!("OPTIONS:");
    println!("  -f, --file <PATH>       Source file to parse (or read from stdin)");
    println!("  -l, --language <LANG>   Language: js, ts, python, go, rust, java");
    println!("  -m, --mode <MODE>       Output mode: imports, exports, all (default: all)");
    println!("  -h, --help              Show this help message");
    println!();
    println!("EXAMPLES:");
    println!("  extract-imports --file src/main.rs");
    println!("  extract-imports --file app.js --language javascript");
    println!("  cat main.go | extract-imports --language go --mode imports");
}
