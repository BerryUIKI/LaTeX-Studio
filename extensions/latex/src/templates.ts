/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface ProjectTemplate {
	id: string;
	title: string;
	description: string;
	files: { [filename: string]: string };
}

export const TEMPLATES: ProjectTemplate[] = [
	{
		id: 'chinese-thesis',
		title: '🎓 中文毕业论文 / 课程设计模板 (ctex)',
		description: '标准中文学术论文骨架，包含中英文摘要、各章节大纲与参考文献',
		files: {
			'main.tex': `% !TEX program = xelatex
\\documentclass[UTF8,12pt,a4paper]{ctexart}

\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{geometry}
\\geometry{left=2.5cm,right=2.5cm,top=2.5cm,bottom=2.5cm}
\\usepackage{booktabs}
\\usepackage{cite}
\\usepackage{hyperref}
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    citecolor=blue,
    urlcolor=blue
}

\\title{\\textbf{基于 LaTeX Studio 的高质量学术排版研究与实践}}
\\author{作者姓名\\\\ \\small 某某大学 计算机科学与技术学院}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
本文档为 LaTeX Studio 专属预置的中文学术论文与毕业设计标准模板。本文介绍了如何利用 LaTeX 强大的宏包系统排版现代科技论文，探讨了数学公式输入、三线表规范与图文交叉引用的最佳工程实践。

\\textbf{关键词：} LaTeX Studio；科技排版；学术论文；公式与图表
\\end{abstract}

\\section{引言}
\\label{sec:intro}
科技文献排版是科研工作的重要组成部分。在传统的排版软件中，复杂的数学公式与大规模参考文献难以高效维护。而 LaTeX 作为业界公认的学术排版标准，具备无与伦比的美观度与一致性\\cite{lamport1994latex}。

\\section{数学公式排版示例}
\\label{sec:math}
下面展示一个经典的傅里叶变换积分公式：
\\begin{equation}
\\label{eq:fourier}
\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} \\, \\mathrm{d}x
\\end{equation}

在式~\\eqref{eq:fourier} 中，$f(x)$ 表示原空间信号，$\\hat{f}(\\xi)$ 表示其在频域的表示。

\\section{数据表格与实验对比}
\\label{sec:table}
学术论文中通常采用三线表格式（由 \\texttt{booktabs} 宏包提供支持），如表~\\ref{tab:results} 所示：

\\begin{table}[htbp]
\\centering
\\caption{不同算法在基准数据集上的性能对比}
\\label{tab:results}
\\begin{tabular}{lccc}
\\toprule
\\textbf{模型名称} & \\textbf{精确率 (Precision)} & \\textbf{召回率 (Recall)} & \\textbf{F1 分数} \\\\
\\midrule
Baseline 算法 & 85.4\\% & 82.1\\% & 83.7\\% \\\\
SVM 增强模型 & 88.9\\% & 86.3\\% & 87.6\\% \\\\
\\textbf{LaTeX Studio 算法} & \\textbf{94.6\\%} & \\textbf{93.8\\%} & \\textbf{94.2\\%} \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\section{结论与展望}
\\label{sec:conclusion}
本文展示了使用 LaTeX Studio 进行学术排版的完整流程。结合开箱即用的编译器管线、原生 PDF 预览以及 SyncTeX 双向联动，科研工作者的排版效率将得到极大的提升。

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}
`,
			'references.bib': `@book{lamport1994latex,
  title={LaTeX: a document preparation system: user's guide and reference manual},
  author={Lamport, Leslie},
  year={1994},
  publisher={Addison-Wesley Reading}
}

@article{knuth1984tex,
  title={The TeXbook},
  author={Knuth, Donald Ervin},
  journal={Addison-Wesley, Reading, MA},
  year={1984}
}
`
		}
	},
	{
		id: 'ieee-paper',
		title: '📄 IEEE Transactions 期刊 / 会议模板',
		description: '标准双栏英文学术论文模板，符合 IEEE Computer Society 投稿规范',
		files: {
			'main.tex': `% !TEX program = pdflatex
\\documentclass[conference]{IEEEtran}

\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{booktabs}

\\begin{document}

\\title{A Modern Workflow for Academic Typesetting with LaTeX Studio}

\\author{\\IEEEauthorblockN{First Author}
\\IEEEauthorblockA{\\textit{Dept. of Computer Science} \\\\
\\textit{University Name}\\\\
City, Country \\\\
email@example.com}
\\and
\\IEEEauthorblockN{Second Author}
\\IEEEauthorblockA{\\textit{Dept. of Electrical Engineering} \\\\
\\textit{University Name}\\\\
City, Country \\\\
email@example.com}
}

\\maketitle

\\begin{abstract}
This document serves as the official IEEE Transactions conference template for LaTeX Studio. It demonstrates the structure, mathematics, tables, and citations required for top-tier conference submissions.
\\end{abstract}

\\begin{IEEEkeywords}
Typesetting, LaTeX Studio, IEEEtran, Academic Workflow
\\end{IEEEkeywords}

\\section{Introduction}
Document preparation systems play a foundational role in dissemination of scientific breakthroughs. With LaTeX Studio, authors can seamlessly author and compile IEEE-compliant publications.

\\section{Methodology}
Consider an optimization problem defined over parameter space $\\Theta$:
\\begin{equation}
\\theta^* = \\arg\\min_{\\theta \\in \\Theta} \\sum_{i=1}^{N} \\mathcal{L}(f(x_i; \\theta), y_i) + \\lambda \\|\\theta\\|_2^2
\\end{equation}

\\section{Conclusion}
We have presented an overview of the modern typesetting environment.

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}
`,
			'references.bib': `@article{einstein1905,
  author = {Einstein, Albert},
  title = {Zur Elektrodynamik bewegter K{\\"o}rper},
  journal = {Annalen der Physik},
  volume = {322},
  number = {10},
  pages = {891--921},
  year = {1905}
}
`
		}
	},
	{
		id: 'beamer-slides',
		title: '📊 Beamer 学术汇报演示幻灯片',
		description: '高校答辩、学术会议与研讨会汇报 PPT 幻灯片模板',
		files: {
			'main.tex': `% !TEX program = xelatex
\\documentclass[10pt,aspectratio=169]{beamer}

\\usetheme{Madrid}
\\usecolortheme{default}

\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}

\\title[LaTeX Studio 演示]{LaTeX Studio: 现代科研学术排版新范式}
\\subtitle{高效、敏捷、开箱即用的工作站环境}
\\author{汇报人：张三}
\\institute{某某大学 计算机学院}
\\date{\\today}

\\begin{document}

\\begin{frame}
  \\titlepage
\\end{frame}

\\begin{frame}{目录}
  \\tableofcontents
\\end{frame}

\\section{研究背景}
\\begin{frame}{研究背景与痛点}
  \\begin{itemize}
    \\item 传统排版工具对于数学公式、参考文献的处理繁琐易错。
    \\item 现有 LaTeX 发行版安装包庞大，初学者配置环境成本高。
    \\item 编辑与 PDF 预览窗口分离，缺乏丝滑的双向定位交互。
  \\end{itemize}
\\end{frame}

\\section{核心方案}
\\begin{frame}{LaTeX Studio 核心架构}
  \\begin{block}{开箱即用的编译管线}
    自动检测 TeX Live / MiKTeX / TinyTeX，一键调度 XeLaTeX 与 latexmk。
  \\end{block}
  \\begin{block}{原生 PDF 实时预览}
    内置基于 Webview 的高精度阅读器，集成 SyncTeX 正反向精准定位。
  \\end{block}
\\end{frame}

\\section{总结与答辩}
\\begin{frame}{致谢与问答}
  \\begin{center}
    \\Huge \\textbf{谢谢各位老师与同学！} \\\\
    \\vspace{1em}
    \\Large 欢迎提问与交流 (Q \\& A)
  \\end{center}
\\end{frame}

\\end{document}
`
		}
	}
];

export class TemplateWizard {
	public static async createProject(): Promise<void> {
		const items = TEMPLATES.map((t) => ({
			label: t.title,
			description: t.description,
			template: t
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: '选择要初始化的学术 LaTeX 模板'
		});

		if (!selected) {
			return;
		}

		// Ask target folder
		const folderUri = await vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			openLabel: '在此文件夹中创建项目'
		});

		if (!folderUri || folderUri.length === 0) {
			return;
		}

		const targetDir = folderUri[0].fsPath;
		const template = selected.template;

		for (const [filename, content] of Object.entries(template.files)) {
			const filePath = path.join(targetDir, filename);
			await fs.promises.writeFile(filePath, content, 'utf8');
		}

		const mainTexPath = path.join(targetDir, 'main.tex');
		const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mainTexPath));
		await vscode.window.showTextDocument(doc);

		vscode.window.showInformationMessage(
			`LaTeX Studio: 成功根据「${template.title}」创建新项目！按 Ctrl+B 即可编译。`
		);
	}
}
