use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilationResult {
    pub success: bool,
    pub exit_code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
}

/// Executes a native TeX compilation step (e.g., xelatex, pdflatex, bibtex)
pub fn execute_compile_step(
    engine: &str,
    args: &[&str],
    working_dir: &Path,
) -> Result<CompilationResult, std::io::Error> {
    let mut command = Command::new(engine);
    command.args(args);
    command.current_dir(working_dir);

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let output = command.output()?;
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    Ok(CompilationResult {
        success: output.status.success(),
        exit_code: output.status.code(),
        stdout,
        stderr,
    })
}
