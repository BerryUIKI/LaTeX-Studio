/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

interface ActionItem {
	label: string;
	description: string;
	icon: string;
	command: string;
}

const ACTION_ITEMS: ActionItem[] = [
	{
		label: 'New Project from Template',
		description: '从学术模板新建项目 (IEEE / 毕业论文 / Beamer)',
		icon: 'repo-create',
		command: 'latex-studio.newProject'
	},
	{
		label: 'Build Document',
		description: '一键编译当前文档 (Ctrl+B)',
		icon: 'play',
		command: 'latex-studio.build'
	},
	{
		label: 'View PDF Preview',
		description: '内置侧边栏预览 (Ctrl+Alt+V)',
		icon: 'file-pdf',
		command: 'latex-studio.viewPdf'
	},
	{
		label: 'SyncTeX Forward Search',
		description: '从代码跳转到 PDF 对应位置 (Ctrl+Alt+J)',
		icon: 'arrow-right',
		command: 'latex-studio.synctex'
	},
	{
		label: 'Select Recipe',
		description: '切换编译引擎 (XeLaTeX / pdfLaTeX / latexmk)',
		icon: 'gear',
		command: 'latex-studio.selectRecipe'
	},
	{
		label: 'Clean Auxiliary Files',
		description: '清理 .aux / .log / .synctex.gz 等缓存文件',
		icon: 'trash',
		command: 'latex-studio.clean'
	},
	{
		label: 'Check TeX Environment',
		description: '检查系统 TeX Live / MiKTeX 安装状态',
		icon: 'check',
		command: 'latex-studio.checkEnvironment'
	}
];

export class ActionTreeItem extends vscode.TreeItem {
	constructor(public readonly action: ActionItem) {
		super(action.label, vscode.TreeItemCollapsibleState.None);
		this.description = action.description;
		this.iconPath = new vscode.ThemeIcon(action.icon);
		this.command = {
			command: action.command,
			title: action.label
		};
	}
}

export class ActionsProvider implements vscode.TreeDataProvider<ActionTreeItem> {
	getTreeItem(element: ActionTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<ActionTreeItem[]> {
		return Promise.resolve(ACTION_ITEMS.map((item) => new ActionTreeItem(item)));
	}
}
