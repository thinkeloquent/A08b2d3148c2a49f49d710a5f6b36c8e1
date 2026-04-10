#[derive(Debug, thiserror::Error)]
pub enum ExtractError {
    #[error("parse error: {0}")]
    Parse(String),
    #[error("unsupported syntax: {0}")]
    Unsupported(String),
}
