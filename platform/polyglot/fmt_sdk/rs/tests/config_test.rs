use fmt_sdk::config::*;
use std::path::Path;

#[test]
fn test_load_config_from_fixture() {
    let fixture_path = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../__fixtures__/config.toml");
    let config = load_config(&fixture_path)
        .expect("Failed to load config.toml fixture");

    // Should have 4 formatter entries
    assert_eq!(config.formatter.len(), 4);

    // Verify Go formatter
    let go = config.formatter.get("go").expect("missing go formatter");
    assert_eq!(go.command, "gofmt");
    assert_eq!(go.args, vec!["-w"]);
    assert_eq!(go.extensions, vec![".go"]);
    assert_eq!(go.includes, vec!["**/*.go"]);
    assert_eq!(go.excludes, vec!["vendor/**"]);

    // Verify Python formatter
    let python = config.formatter.get("python").expect("missing python formatter");
    assert_eq!(python.command, "ruff");
    assert_eq!(python.args, vec!["format", "--check"]);
    assert_eq!(python.extensions, vec![".py"]);
    assert_eq!(python.includes, vec!["**/*.py"]);
    assert_eq!(python.excludes, vec!["__pycache__/**", ".venv/**"]);

    // Verify Node formatter
    let node = config.formatter.get("node").expect("missing node formatter");
    assert_eq!(node.command, "biome");
    assert_eq!(node.args, vec!["format", "--write"]);
    assert_eq!(node.extensions, vec![".js", ".ts", ".mjs", ".mts"]);
    assert_eq!(node.includes, vec!["src/**"]);
    assert_eq!(node.excludes, vec!["node_modules/**", "dist/**"]);

    // Verify Rust formatter
    let rust = config.formatter.get("rust").expect("missing rust formatter");
    assert_eq!(rust.command, "rustfmt");
    assert_eq!(rust.args, vec!["--edition", "2021"]);
    assert_eq!(rust.extensions, vec![".rs"]);
    assert_eq!(rust.includes, vec!["src/**/*.rs"]);
    assert_eq!(rust.excludes, vec!["target/**"]);
}

#[test]
fn test_load_config_missing_file() {
    let result = load_config(Path::new("/nonexistent/path/config.toml"));
    assert!(result.is_err());
}

#[test]
fn test_load_config_empty_toml() {
    // An empty TOML string should parse with defaults (empty formatter map)
    let content = "";
    let config: FmtSdkConfig = toml::from_str(content).unwrap();
    assert!(config.formatter.is_empty());
}

#[test]
fn test_formatter_entry_defaults() {
    // A formatter with only the required 'command' field
    let toml_str = r#"
[formatter.minimal]
command = "cat"
"#;
    let config: FmtSdkConfig = toml::from_str(toml_str).unwrap();
    let minimal = config.formatter.get("minimal").unwrap();
    assert_eq!(minimal.command, "cat");
    assert!(minimal.args.is_empty());
    assert!(minimal.extensions.is_empty());
    assert!(minimal.includes.is_empty());
    assert!(minimal.excludes.is_empty());
}
