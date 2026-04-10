use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Debug, Deserialize, PartialEq)]
pub struct FormatterEntry {
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub extensions: Vec<String>,
    #[serde(default)]
    pub includes: Vec<String>,
    #[serde(default)]
    pub excludes: Vec<String>,
}

#[derive(Debug, Deserialize, PartialEq)]
pub struct FmtSdkConfig {
    #[serde(default)]
    pub formatter: HashMap<String, FormatterEntry>,
}

pub fn load_config(path: &Path) -> Result<FmtSdkConfig, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let config: FmtSdkConfig = toml::from_str(&content)?;
    Ok(config)
}
