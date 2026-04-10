use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum SpecifierKind {
    Default,
    Named,
    Namespace,
    SideEffect,
    ExportDefault,
    ExportNamed,
    ExportAll,
    ExportNamespace,
}

impl fmt::Display for SpecifierKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Default => write!(f, "default"),
            Self::Named => write!(f, "named"),
            Self::Namespace => write!(f, "namespace"),
            Self::SideEffect => write!(f, "side-effect"),
            Self::ExportDefault => write!(f, "export-default"),
            Self::ExportNamed => write!(f, "export-named"),
            Self::ExportAll => write!(f, "export-all"),
            Self::ExportNamespace => write!(f, "export-namespace"),
        }
    }
}

pub fn format_named(name: &str, alias: Option<&str>) -> String {
    match alias {
        Some(a) if a != name => format!("named: {} as {}", name, a),
        _ => format!("named: {}", name),
    }
}

pub fn format_namespace(name: &str) -> String {
    format!("namespace: {}", name)
}

pub fn format_export_named(name: &str, alias: Option<&str>) -> String {
    match alias {
        Some(a) if a != name => format!("export-named: {} as {}", name, a),
        _ => format!("export-named: {}", name),
    }
}

pub fn format_export_all() -> String {
    "export-all".to_string()
}
