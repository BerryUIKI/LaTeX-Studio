# LaTeX Studio Agents Instructions

This document provides foundational rules and instructions for AI coding agents working on the **LaTeX Studio** codebase.

---

## 🎯 Project Mission
Transform the codebase into **LaTeX Studio**: a dedicated, high-performance academic workstation for LaTeX authoring, live compilation, PDF synchronization, and scientific writing assistance.

---

## 🏛️ Core Architecture
1. **Workbench & Editor**: Monaco Editor and workbench services under `src/` and customized `product.json`.
2. **Dedicated Language Extension (`extensions/latex/`)**:
   - `compiler.ts`: TeX build pipeline orchestration.
   - `detector.ts`: Environment and engine discovery.
   - `pdfViewer.ts` & `synctex.ts`: Side-by-side Webview PDF preview & SyncTeX bi-directional navigation.
   - `academicAssistant.ts`: AI academic tone refinement and style polishing.
   - `errorExplainer.ts`: TeX error diagnosis and one-click QuickFixes.
   - `mathAssistant.ts`: Natural language to LaTeX equation search and insertion.
   - `tableGenerator.ts`: Markdown/CSV to `booktabs` table converter.
   - `bibIndexer.ts`, `citationCompletion.ts`, `citationHover.ts`: BibTeX intelligence.
3. **Progressive Lightweight Native Core (`src-tauri/`)**:
   - High-throughput Rust micro-engine for microsecond log parsing, instant toolchain discovery, and streaming BibTeX indexing.

---

## 📜 Development & GitFlow Rules
- **Branching**: Always branch from `develop` (`feature/<name>`). Never commit directly to `main`.
- **Atomic PRs & Small Commits**: Push incremental commits, create GitHub PRs using `gh pr create`, and merge via `gh pr merge <num> --merge --delete-branch`.
- **Documentation Policy**: **All documentation, comments, and commit messages MUST be written in English**.
- **Validation**: Ensure both TypeScript and Rust test suites (`cargo test --manifest-path src-tauri/Cargo.toml`) pass without errors.
