# Contributing to LaTeX Studio

Welcome, and thank you for your interest in contributing to **LaTeX Studio**!

LaTeX Studio is an open-source, high-performance desktop IDE and scientific writing workstation. This document provides guidelines for reporting issues, proposing features, and submitting pull requests.

---

## 🛠️ GitFlow Workflow

We strictly adhere to the **GitFlow** branching strategy:

1. **`main`**: Production releases. Direct commits are strictly prohibited.
2. **`develop`**: Central integration branch for ongoing development.
3. **`feature/<name>`**: Feature branches branched from `develop` and merged via atomic Pull Requests.
4. **`release/<version>`**: Release candidates and hardening.
5. **`hotfix/<name>`**: Urgent production fixes branched directly from `main`.

---

## 💻 Development & Building

### Prerequisites
- **Node.js**: v20.x or newer
- **Rust**: 1.75+ or newer with `cargo` installed
- **npm / yarn**: Standard package manager
- **TeX distribution**: TeX Live, MiKTeX, MacTeX, or TinyTeX on your `PATH`

### Step-by-Step Setup
1. **Clone your fork**:
   ```bash
   git clone https://github.com/BerryUIKI/LaTeX-Studio.git
   cd LaTeX-Studio
   ```

2. **Branch off `develop`**:
   ```bash
   git checkout develop
   git checkout -b feature/my-new-feature
   ```

3. **Verify Rust Core**:
   ```bash
   cd src-tauri
   cargo test
   cd ..
   ```

4. **Compile LaTeX Extension**:
   ```bash
   npm run gulp compile-extension:latex
   ```

---

## 📝 Commit Conventions

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(...)`: A new feature or user-facing functionality
- `fix(...)`: A bug fix or error resolution
- `docs(...)`: Documentation updates or additions
- `refactor(...)`: Code restructuring without functional changes
- `perf(...)`: Performance optimization
- `test(...)`: Adding or updating test suites
- `chore(...)`: Tooling, build pipeline, or dependency maintenance

---

## 🔍 Pull Request Guidelines

1. **Atomic & Focused**: Keep PRs small, cohesive, and easy to review.
2. **Target Branch**: Always open PRs against **`develop`** (never directly against `main`).
3. **Documentation**: All public APIs, features, and user-facing documents must be written in **English**.
4. **Automated Verification**: Ensure `cargo test` passes and TypeScript compiles with zero errors before opening a PR.

---

## 📄 License

By contributing to LaTeX Studio, you agree that your contributions will be licensed under the project's [MIT License](LICENSE.txt).
