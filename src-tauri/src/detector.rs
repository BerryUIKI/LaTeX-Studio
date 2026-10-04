use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeXEngineStatus {
    pub xelatex: bool,
    pub pdflatex: bool,
    pub lualatex: bool,
    pub latexmk: bool,
    pub bibtex: bool,
    pub synctex: bool,
}

/// Detects available TeX engines on system PATH
pub fn detect_tex_engines() -> TeXEngineStatus {
    TeXEngineStatus {
        xelatex: is_command_available("xelatex"),
        pdflatex: is_command_available("pdflatex"),
        lualatex: is_command_available("lualatex"),
        latexmk: is_command_available("latexmk"),
        bibtex: is_command_available("bibtex"),
        synctex: is_command_available("synctex"),
    }
}

fn is_command_available(cmd: &str) -> bool {
    let mut command = Command::new(cmd);
    command.arg("--version");
    
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // CREATE_NO_WINDOW = 0x08000000
        command.creation_flags(0x08000000);
    }

    match command.output() {
        Ok(output) => output.status.success(),
        Err(_) => false,
    }
}
