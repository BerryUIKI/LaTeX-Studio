//! High-performance native core modules for LaTeX Studio
//! Handles TeX engine detection, compilation pipeline execution,
//! ultra-fast log parsing, and BibTeX indexing.

pub mod detector;
pub mod parser;
pub mod bibtex;
pub mod compiler;

pub use detector::{detect_tex_engines, TeXEngineStatus};
pub use parser::{parse_latex_log, Diagnostic, DiagnosticSeverity};
pub use bibtex::{index_bibtex_content, BibEntry};
