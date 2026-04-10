/// Package-local logger with prefixed output.
pub struct Logger {
    prefix: String,
}

impl Logger {
    /// Create a new logger with package name and filename prefix.
    pub fn new(package_name: &str, filename: &str) -> Self {
        Self {
            prefix: format!("[{}:{}]", package_name, filename),
        }
    }

    pub fn debug(&self, msg: &str) {
        log::debug!("{} {}", self.prefix, msg);
    }

    pub fn info(&self, msg: &str) {
        log::info!("{} {}", self.prefix, msg);
    }

    pub fn warn(&self, msg: &str) {
        log::warn!("{} {}", self.prefix, msg);
    }

    pub fn error(&self, msg: &str) {
        log::error!("{} {}", self.prefix, msg);
    }
}
