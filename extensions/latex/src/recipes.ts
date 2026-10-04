/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface ToolStep {
	command: string;
	args: string[];
}

export interface Recipe {
	id: string;
	label: string;
	description: string;
	tools: ToolStep[];
}

export const DEFAULT_RECIPES: Recipe[] = [
	{
		id: 'xelatex',
		label: 'XeLaTeX (推荐: 中英文通用)',
		description: '直接调用 xelatex 快速编译（支持中文与现代字体）',
		tools: [
			{
				command: 'xelatex',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '%DOC%']
			}
		]
	},
	{
		id: 'pdflatex',
		label: 'pdfLaTeX (经典英文期刊)',
		description: '调用 pdflatex 编译',
		tools: [
			{
				command: 'pdflatex',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '%DOC%']
			}
		]
	},
	{
		id: 'latexmk-xelatex',
		label: 'latexmk (XeLaTeX + BibTeX 自动化)',
		description: '自动化多遍构建，支持参考文献与交叉引用完整解析',
		tools: [
			{
				command: 'latexmk',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '-xelatex', '%DOC%']
			}
		]
	},
	{
		id: 'latexmk-pdf',
		label: 'latexmk (pdfLaTeX + BibTeX 自动化)',
		description: '自动化多遍构建 pdfLaTeX',
		tools: [
			{
				command: 'latexmk',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '-pdf', '%DOC%']
			}
		]
	},
	{
		id: 'lualatex',
		label: 'LuaLaTeX',
		description: '调用 lualatex 编译现代高级文档',
		tools: [
			{
				command: 'lualatex',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '%DOC%']
			}
		]
	},
	{
		id: 'xelatex-bibtex-xelatex',
		label: 'XeLaTeX -> BibTeX -> XeLaTeX x2',
		description: '标准完整四步编译流，保证参考文献引用序号完全更新',
		tools: [
			{
				command: 'xelatex',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '%DOC%']
			},
			{
				command: 'bibtex',
				args: ['%DOC_BASE%']
			},
			{
				command: 'xelatex',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '%DOC%']
			},
			{
				command: 'xelatex',
				args: ['-synctex=1', '-interaction=nonstopmode', '-file-line-error', '%DOC%']
			}
		]
	}
];
