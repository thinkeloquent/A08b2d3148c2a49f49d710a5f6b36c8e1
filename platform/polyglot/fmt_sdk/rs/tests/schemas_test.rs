use fmt_sdk::schemas::*;
use std::fs;
use std::path::Path;

#[test]
fn test_language_enum_values() {
    assert_eq!(serde_json::to_string(&Language::Go).unwrap(), "\"go\"");
    assert_eq!(serde_json::to_string(&Language::Python).unwrap(), "\"python\"");
    assert_eq!(serde_json::to_string(&Language::Node).unwrap(), "\"node\"");
    assert_eq!(serde_json::to_string(&Language::Rust).unwrap(), "\"rust\"");
    assert_eq!(serde_json::to_string(&Language::Shell).unwrap(), "\"shell\"");
    assert_eq!(serde_json::to_string(&Language::Sql).unwrap(), "\"sql\"");
    assert_eq!(serde_json::to_string(&Language::Markup).unwrap(), "\"markup\"");
}

#[test]
fn test_severity_enum_values() {
    assert_eq!(serde_json::to_string(&Severity::Error).unwrap(), "\"error\"");
    assert_eq!(serde_json::to_string(&Severity::Warning).unwrap(), "\"warning\"");
    assert_eq!(serde_json::to_string(&Severity::Info).unwrap(), "\"info\"");
    assert_eq!(serde_json::to_string(&Severity::Hint).unwrap(), "\"hint\"");
}

#[test]
fn test_format_request_round_trip() {
    let req = FormatRequest {
        source: "fn main() {}\n".to_string(),
        language: Language::Rust,
        options: Some(serde_json::json!({"tab_width": 4})),
        context: Some(serde_json::json!({"caller": "test"})),
    };

    let json = serde_json::to_string(&req).unwrap();
    let deserialized: FormatRequest = serde_json::from_str(&json).unwrap();
    assert_eq!(req, deserialized);
}

#[test]
fn test_format_result_round_trip() {
    let result = FormatResult {
        success: true,
        formatted: Some("fn main() {}\n".to_string()),
        diff: Some("@@ no diff @@".to_string()),
        diagnostics: vec![
            Diagnostic {
                file: Some("main.rs".to_string()),
                line: Some(1),
                column: Some(1),
                severity: Severity::Warning,
                message: "unused variable".to_string(),
                rule: Some("dead_code".to_string()),
            },
        ],
        metadata: Some(serde_json::json!({"duration_ms": 5})),
    };

    let json = serde_json::to_string(&result).unwrap();
    let deserialized: FormatResult = serde_json::from_str(&json).unwrap();
    assert_eq!(result, deserialized);
}

#[test]
fn test_optional_fields_omitted() {
    let req = FormatRequest {
        source: "x = 1\n".to_string(),
        language: Language::Python,
        options: None,
        context: None,
    };

    let json = serde_json::to_string(&req).unwrap();
    let value: serde_json::Value = serde_json::from_str(&json).unwrap();

    // options and context should NOT appear in JSON when None
    assert!(value.get("options").is_none());
    assert!(value.get("context").is_none());
    // required fields should be present
    assert!(value.get("source").is_some());
    assert!(value.get("language").is_some());

    let diag = Diagnostic {
        file: None,
        line: None,
        column: None,
        severity: Severity::Error,
        message: "syntax error".to_string(),
        rule: None,
    };

    let json = serde_json::to_string(&diag).unwrap();
    let value: serde_json::Value = serde_json::from_str(&json).unwrap();

    assert!(value.get("file").is_none());
    assert!(value.get("line").is_none());
    assert!(value.get("column").is_none());
    assert!(value.get("rule").is_none());
    assert!(value.get("severity").is_some());
    assert!(value.get("message").is_some());

    let result = FormatResult {
        success: false,
        formatted: None,
        diff: None,
        diagnostics: vec![],
        metadata: None,
    };

    let json = serde_json::to_string(&result).unwrap();
    let value: serde_json::Value = serde_json::from_str(&json).unwrap();

    assert!(value.get("formatted").is_none());
    assert!(value.get("diff").is_none());
    assert!(value.get("metadata").is_none());
    assert!(value.get("success").is_some());
    assert!(value.get("diagnostics").is_some());
}

#[test]
fn test_fixture_format_requests() {
    let fixture_path = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../__fixtures__/format_request.json");
    let content = fs::read_to_string(&fixture_path)
        .expect("Failed to read format_request.json fixture");
    let data: serde_json::Value = serde_json::from_str(&content).unwrap();
    let tests = data["format_request_tests"].as_array().unwrap();

    for test_case in tests {
        let input = &test_case["input"];
        let req: FormatRequest = serde_json::from_value(input.clone())
            .unwrap_or_else(|e| panic!("Failed to deserialize {}: {}", test_case["id"], e));

        // Re-serialize and compare
        let reserialized = serde_json::to_value(&req).unwrap();
        assert_eq!(
            input, &reserialized,
            "Round-trip failed for {}",
            test_case["id"]
        );
    }
}

#[test]
fn test_fixture_format_results() {
    let fixture_path = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../__fixtures__/format_result.json");
    let content = fs::read_to_string(&fixture_path)
        .expect("Failed to read format_result.json fixture");
    let data: serde_json::Value = serde_json::from_str(&content).unwrap();
    let tests = data["format_result_tests"].as_array().unwrap();

    for test_case in tests {
        let input = &test_case["input"];
        let result: FormatResult = serde_json::from_value(input.clone())
            .unwrap_or_else(|e| panic!("Failed to deserialize {}: {}", test_case["id"], e));

        // Re-serialize and compare
        let reserialized = serde_json::to_value(&result).unwrap();
        assert_eq!(
            input, &reserialized,
            "Round-trip failed for {}",
            test_case["id"]
        );
    }
}
