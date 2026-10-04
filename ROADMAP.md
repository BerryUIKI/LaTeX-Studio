# LaTeX Studio Development Roadmap & Engineering Milestones

> **LaTeX Studio** is an open-source, high-performance desktop IDE and academic writing workstation built on top of a modern workbench architecture. It provides an out-of-the-box, frictionless environment for researchers, scientists, students, and engineers working with LaTeX, TeX, and BibTeX.

---

## 🧭 Executive Summary & Vision

Traditional LaTeX workflows require complex manual toolchain configuration, cumbersome third-party PDF viewers with fragile inverse-search setups, and external symbol cheat sheets.

**LaTeX Studio** transforms this experience into a cohesive, dedicated desktop application:
1. **Zero-Configuration Onboarding**: Automatic discovery of system TeX distributions (TeX Live, MiKTeX, MacTeX, TinyTeX).
2. **Integrated Dual-Direction Editing**: Native side-by-side PDF previewing with sub-second SyncTeX synchronization.
3. **Visual Mathematical Assistance**: Clickable symbol palettes, structure navigation, and live math hover rendering.
4. **Academic Project Blueprints**: One-click boilerplate scaffolding for IEEE, ACM, theses, and Beamer presentations.
5. **AI-Assisted Scientific Writing**: Context-aware grammar linting, academic paraphrasing, and automated LaTeX error resolution.

---

## 🏛️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                LaTeX Studio Shell                                 |
|  - Custom Product Branding (product.json, application protocol: latex-studio://)   |
|  - Academic Activity Bar & Sidebar Containers (Outline, Symbols, Actions)         |
|  - Dedicated Editor Title Actions (Compile, PDF Preview, Clean)                   |
+-----------------------------------------------------------------------------------+
|                          Built-in Extension Core (`latex`)                        |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   TeX Detector     |  |    Compiler Runner   |  |     Log Diagnostic        |  |
|  | - TeX Live/MiKTeX  |  | - XeLaTeX / pdfLaTeX |  | - file-line-error parser  |  |
|  | - TinyTeX / MacTeX |  | - latexmk automation |  | - BadBox & Warning triage |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |  SyncTeX Bridge    |  |  Embedded PDF Viewer |  |     Template Wizard       |  |
|  | - Forward Sync     |  | - Webview / PDF.js   |  | - Chinese Thesis (ctex)   |  |
|  | - Inverse Sync     |  | - Auto-reload buffer |  | - IEEEtran / Beamer / ACM |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Math Symbol Palette|  |   Document Outline   |  |     Citation Engine       |  |
|  | - Greek / Calculus |  | - Section tree nav   |  | - .bib index & completion |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
|                             Platform Foundation                                   |
|      Electron / Node.js Runtime + Monaco Editor + VS Code OSS Workbench Core      |
+-----------------------------------------------------------------------------------+
```

---

## 📅 Roadmap & Milestones

### Milestone 1: Foundation, Rebranding & Editing Essentials (v0.1.0)
*Status: Completed (PR #6)*
- [x] Configure dedicated application identity in `product.json` and `package.json` (`LaTeX Studio`).
- [x] Establish GitFlow branching architecture (`main`, `develop`, `feature/*`).
- [x] Configure LaTeX file associations (`.tex`, `.ltx`, `.sty`, `.cls`, `.bib`).
- [x] Optimize editor defaults: auto soft-wrapping, bracket pair colorization, and automatic `$` enclosing pairs.
- [x] Provide standard LaTeX snippet library (equations, matrices, figures, three-line tables, citations).

---

### Milestone 2: Core Compilation Engine & Diagnostic Pipeline (v0.2.0)
*Status: Completed (PR #7)*
- [x] Implement `TeXDetector` to discover installed toolchains (XeLaTeX, pdfLaTeX, LuaLaTeX, Latexmk, BibTeX, Biber).
- [x] Implement `LaTeXCompiler` with multi-step recipe runner, streaming output channel, and task cancellation.
- [x] Implement `LaTeXCleaner` for one-click removal of intermediate auxiliary files (`.aux`, `.log`, `.synctex.gz`, etc.).
- [x] Implement `LaTeXLogParser` to translate raw log files into structured editor diagnostics in the Problems panel.
- [x] Add compiler controls to editor titlebar (`$(play)` Build, `$(trash)` Clean) and status bar recipe picker.

---

### Milestone 3: Embedded PDF Viewer & SyncTeX Bidirectional Sync (v0.3.0)
*Status: Completed (PR #8)*
- [x] Implement `PDFViewerManager` hosting an embedded, high-performance webview PDF viewer.
- [x] Add auto-refresh pipeline triggered upon successful compilation.
- [x] Implement `SyncTeXManager` for forward search (`Ctrl+Alt+J`): navigate from source code to PDF page.
- [x] Implement inverse search: map PDF coordinates back to source code lines.
- [x] Add editor title action (`$(file-pdf)` View PDF) and status bar shortcuts.

---

### Milestone 4: Academic Workbench & Visual Math Tools (v0.4.0)
*Status: Completed (PR #9)*
- [x] Add dedicated Activity Bar icon and `latex-studio-sidebar` container.
- [x] Implement `SymbolsProvider` with categorized mathematical and Greek symbol palettes (click-to-insert).
- [x] Implement `OutlineProvider` for real-time document structure exploration (`\part` to `\paragraph`).
- [x] Implement `ActionsProvider` providing a quick dashboard for compilation, viewer, cleanup, and diagnostics.

---

### Milestone 5: Project Template Wizard & Interactive Walkthrough (v0.5.0)
*Status: Completed (PR #10)*
- [x] Implement `TemplateWizard` for instant project scaffolding.
- [x] Pre-bundle academic templates:
  - Chinese Graduation Thesis / Course Project (`ctexart` / `ctexrep`)
  - IEEE Transactions Conference / Journal Paper (`IEEEtran`)
  - Beamer Academic Presentation Slides (`Madrid` theme)
- [x] Author comprehensive interactive "Getting Started with LaTeX Studio" Walkthrough in the welcome flow.

---

### Milestone 6: Math Live Preview & KaTeX Hover Tooltips (v0.6.0)
*Status: Completed (PR #12)*
- [x] Implement `MathExtractor` to extract inline math (`$...$`), display math (`\[...\]`), and equation environments (`equation`, `align`, `gather`, `matrix`).
- [x] Implement `MathHoverProvider` rendering live mathematical formulas on hover in Monaco MarkdownString.
- [x] Strip label tags dynamically for clean KaTeX math rendering and embed quick action links.
- [x] Provide configurable toggle `latex-studio.hover.mathPreview.enabled`.

---

### Milestone 7: Bibliography & Citation Intelligence (v0.7.0)
*Status: Completed (PR #13)*
- [x] Implement `BibIndexer` with background file watcher to parse and index workspace `.bib` database files.
- [x] Implement `CitationCompletionProvider` with fuzzy search across citation keys, authors, titles, and publication years for `\cite{...}` commands.
- [x] Implement `CitationHoverProvider` displaying rich formatted bibliographic reference cards and missing citation warnings.
- [x] Provide user configuration settings: `latex-studio.citation.autocomplete.enabled` and `latex-studio.citation.hover.enabled`.

---

### Milestone 8: AI Scientific Writing & Error Resolution Assistant (v0.8.0)
*Status: Planned*
- [ ] Integrated academic polishing assistant: refine tone, enhance vocabulary, and check grammar.
- [ ] Natural language LaTeX equation generator (e.g., "Euler's identity" -> `$e^{i\pi} + 1 = 0$`).
- [ ] Intelligent LaTeX error analyzer: explain obscure TeX errors (e.g., `Missing $ inserted`, `Underfull \hbox`) in plain language with one-click fixes.
- [ ] Markdown / CSV to LaTeX booktabs table generator.

---

### Milestone 9: Collaborative & Cloud Synchronization (v0.9.0)
*Status: Planned*
- [ ] Direct Overleaf Git bridge integration (clone, pull, push with credential persistence).
- [ ] Cloud compilation fallback: execute builds in a containerized TeX Live environment when local engines are absent.
- [ ] Academic reviewer annotations and margin comment management.

---

### Milestone 10: Production Hardening, Distribution & Packaging (v1.0.0)
*Status: Planned*
- [ ] Cross-platform desktop builds via Electron packager:
  - Windows: NSIS Installer & Portable ZIP (`LaTeXStudio-Setup-x64.exe`)
  - macOS: Universal DMG & App Bundle (Apple Silicon & Intel)
  - Linux: AppImage, DEB, and RPM packages
- [ ] Optional bundled TinyTeX distribution installer for 100% zero-dependency offline installations.
- [ ] Automated GitHub Actions CI/CD matrix for release builds, code signing, and checksum generation.
- [ ] Official documentation portal and quick-start tutorials.

---

## 🔄 Development Process & Governance

We adhere strictly to standard **GitFlow** and **Semantic Versioning (SemVer)**:
- **`main`**: Production-ready releases. Protected branch.
- **`develop`**: Primary integration branch for active development.
- **`feature/<name>`**: Feature branches branched from `develop`, merged via Pull Requests.
- **`release/<version>`**: Release stabilization branches for QA and final packaging.
- **`hotfix/<name>`**: Emergency fixes branched directly from `main` and back-merged to `develop`.

### Commit Conventions
Every commit must follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(...)`: New feature or user-facing capability.
- `fix(...)`: Bug fix.
- `docs(...)`: Documentation changes only.
- `chore(...)`: Maintenance, dependency updates, or build script tweaks.
- `refactor(...)`: Code changes that neither fix a bug nor add a feature.

---

## 📈 Milestones Status Overview

| Version | Milestone Scope | Status | PR Reference |
| :--- | :--- | :---: | :---: |
| **v0.1.0** | Product Rebranding, File Associations & Snippets | ✅ Complete | [PR #6](https://github.com/BerryUIKI/LaTeX-Studio/pull/6) |
| **v0.2.0** | Compilation Engine, Recipes & Log Diagnostics | ✅ Complete | [PR #7](https://github.com/BerryUIKI/LaTeX-Studio/pull/7) |
| **v0.3.0** | Embedded PDF Viewer & SyncTeX Dual Navigation | ✅ Complete | [PR #8](https://github.com/BerryUIKI/LaTeX-Studio/pull/8) |
| **v0.4.0** | Activity Bar Sidebar, Symbol Palette & Outline | ✅ Complete | [PR #9](https://github.com/BerryUIKI/LaTeX-Studio/pull/9) |
| **v0.5.0** | Project Template Wizard & Getting Started Guide | ✅ Complete | [PR #10](https://github.com/BerryUIKI/LaTeX-Studio/pull/10) |
| **v0.6.0** | Math Live Hover Rendering & Formula Preview | ✅ Complete | [PR #12](https://github.com/BerryUIKI/LaTeX-Studio/pull/12) |
| **v0.7.0** | Bibliography Management & Citation Intelligence | ✅ Complete | [PR #13](https://github.com/BerryUIKI/LaTeX-Studio/pull/13) |
| **v0.8.0** | AI Academic Writing Assistant & Error Resolver | 🟡 Planned | Next Priority |
| **v0.9.0** | Overleaf Sync & Cloud Compilation Service | ⚪ Planned | Q3 2026 |
| **v1.0.0** | Production Packaging, Installers & Distribution | ⚪ Planned | Q3 2026 |
