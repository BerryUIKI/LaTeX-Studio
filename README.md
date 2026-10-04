# LaTeX Studio

> **LaTeX Studio** 是一套基于现代现代化工作台架构的专用 LaTeX 桌面 IDE / 学术写作工作站，致力于为学术研究、论文写作、科技文献排版提供开箱即用、极致流畅的开发与排版体验。

---

## 🎯 核心目标与特性 (Core Features)

- ⚡ **开箱即用编译链**：智能检测 TeX Live / MiKTeX / MacTeX / TinyTeX，预设 XeLaTeX, pdfLaTeX, LuaLaTeX, latexmk 编译流。
- 📖 **原生内置 PDF 预览 & SyncTeX**：无缝分屏阅读，支持正向（代码 -> PDF）与反向（PDF -> 代码）精确定位跳转。
- 📐 **可视化数学与符号面板**：希腊字母、数学算子、环境模版可视拾取，公式实时渲染悬停预览。
- 📚 **学术大纲与 BibTeX 管理**：文档章节结构大纲树一键直达，参考文献引用智能联想。
- 🎨 **学术模板中心**：内置 IEEE, ACM, 硕博/本科毕业论文, Beamer 幻灯片等一键起步模板。
- 🤖 **AI 学术助手**：集成学术润色、降重、公式生成与 LaTeX 编译报错一键修复。

---

## 🛠️ 仓库架构与分支规范 (GitFlow)

本项目严格采用 **GitFlow** 工作流与微步提交规范：
- `main`：生产/正式发布分支，保持代码高可用。
- `develop`：主集成开发分支。
- `feature/*`：功能特性分支，小步 PR 合入 `develop`。
- `release/*` 与 `hotfix/*`：版本发布与紧急修复分支。


## Contributing

There are many ways in which you can participate in this project, for example:

* [Submit bugs and feature requests](https://github.com/microsoft/vscode/issues), and help us verify them as they are checked in
* Review [source code changes](https://github.com/microsoft/vscode/pulls)
* Review the [documentation](https://github.com/microsoft/vscode-docs) and make pull requests for anything from typos to new content.

If you are interested in fixing issues and contributing directly to the codebase, please see the document [How to Contribute](https://github.com/microsoft/vscode/wiki/How-to-Contribute), which covers the following:

* [How to build and run from source](https://github.com/microsoft/vscode/wiki/How-to-Contribute)
* [The development workflow, including debugging and running tests](https://github.com/microsoft/vscode/wiki/How-to-Contribute#debugging)
* [Coding guidelines](https://github.com/microsoft/vscode/wiki/Coding-Guidelines)
* [Submitting pull requests](https://github.com/microsoft/vscode/wiki/How-to-Contribute#pull-requests)
* [Finding an issue to work on](https://github.com/microsoft/vscode/wiki/How-to-Contribute#where-to-contribute)
* [Contributing to translations](https://aka.ms/vscodeloc)

## Feedback

* Ask a question on [Stack Overflow](https://stackoverflow.com/questions/tagged/vscode)
* [Request a new feature](CONTRIBUTING.md)
* Upvote [popular feature requests](https://github.com/microsoft/vscode/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)
* [File an issue](https://github.com/microsoft/vscode/issues)
* Connect with the extension author community on [GitHub Discussions](https://github.com/microsoft/vscode-discussions/discussions) or [Slack](https://aka.ms/vscode-dev-community)
* Follow [@code](https://x.com/code) and let us know what you think!

See our [wiki](https://github.com/microsoft/vscode/wiki/Feedback-Channels) for a description of each of these channels and information on some other available community-driven channels.

## Related Projects

Many of the core components and extensions to VS Code live in their own repositories on GitHub. For example, the [node debug adapter](https://github.com/microsoft/vscode-node-debug) and the [mono debug adapter](https://github.com/microsoft/vscode-mono-debug) repositories are separate from each other. For a complete list, please visit the [Related Projects](https://github.com/microsoft/vscode/wiki/Related-Projects) page on our [wiki](https://github.com/microsoft/vscode/wiki).

## Bundled Extensions

VS Code includes a set of built-in extensions located in the [extensions](extensions) folder, including grammars and snippets for many languages. Extensions that provide rich language support (inline suggestions, Go to Definition) for a language have the suffix `language-features`. For example, the `json` extension provides coloring for `JSON` and the `json-language-features` extension provides rich language support for `JSON`.

## Development Container

This repository includes a Visual Studio Code Dev Containers / GitHub Codespaces development container.

* For [Dev Containers](https://aka.ms/vscode-remote/download/containers), use the **Dev Containers: Clone Repository in Container Volume...** command, which creates a Docker volume for better disk I/O on macOS and Windows.
  * If you already have VS Code and Docker installed, you can also click [here](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/vscode) to get started. This will cause VS Code to automatically install the Dev Containers extension if needed, clone the source code into a container volume, and spin up a dev container for use.

* For Codespaces, install the [GitHub Codespaces](https://marketplace.visualstudio.com/items?itemName=GitHub.codespaces) extension in VS Code, and use the **Codespaces: Create New Codespace** command.

Docker / the Codespace should have at least **4 cores and 6 GB of RAM (8 GB recommended)** to run a full build. See the [development container README](.devcontainer/README.md) for more information.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE.txt) license.
