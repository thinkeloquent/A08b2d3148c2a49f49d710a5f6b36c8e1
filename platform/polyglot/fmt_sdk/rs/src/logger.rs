use log::{debug, error, info, warn};
use std::path::Path;

pub struct Logger {
    pkg: String,
    file: String,
}

impl Logger {
    pub fn create(pkg: &str, file: &str) -> Self {
        let filename = Path::new(file)
            .file_name()
            .and_then(|f| f.to_str())
            .unwrap_or("unknown")
            .to_string();
        Logger {
            pkg: pkg.to_string(),
            file: filename,
        }
    }

    pub fn info(&self, msg: &str) {
        info!("[{}:{}] {}", self.pkg, self.file, msg);
    }

    pub fn warn(&self, msg: &str) {
        warn!("[{}:{}] {}", self.pkg, self.file, msg);
    }

    pub fn error(&self, msg: &str) {
        error!("[{}:{}] {}", self.pkg, self.file, msg);
    }

    pub fn debug(&self, msg: &str) {
        debug!("[{}:{}] {}", self.pkg, self.file, msg);
    }
}
