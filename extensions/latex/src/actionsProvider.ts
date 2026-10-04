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
		description: 'Scaffold academic projects (IEEE / Thesis / Beamer)',
		icon: 'repo-create',
		command: 'latex-studio.newProject'
	},
	{
		label: 'Academic Polish & Tone Assistant',
		description: 'Refine academic tone, passive stance, and concise style',
		icon: 'sparkle',
		command: 'latex-studio.academicPolish'
	},
	{
		label: 'Math Equation Assistant',
		description: 'Natural language search for LaTeX mathematical equations',
		icon: 'symbol-operator',
		command: 'latex-studio.insertMathEquation'
	},
	{
		label: 'Table Generator (Markdown / CSV)',
		description: 'Convert tables or CSV into publication-ready booktabs tables',
		icon: 'table',
		command: 'latex-studio.generateTable'
	},
	{
		label: 'Build Document',
		description: 'Compile active document (Ctrl+B)',
		icon: 'play',
		command: 'latex-studio.build'
	},
	{
		label: 'View PDF Preview',
		description: 'Embedded side-by-side preview (Ctrl+Alt+V)',
		icon: 'file-pdf',
		command: 'latex-studio.viewPdf'
	},
	{
		label: 'SyncTeX Forward Search',
		description: 'Jump from source code to PDF position (Ctrl+Alt+J)',
		icon: 'arrow-right',
		command: 'latex-studio.synctex'
	},
	{
		label: 'Select Recipe',
		description: 'Switch compiler engine (XeLaTeX / pdfLaTeX / latexmk)',
		icon: 'gear',
		command: 'latex-studio.selectRecipe'
	},
	{
		label: 'Clean Auxiliary Files',
		description: 'Remove .aux / .log / .synctex.gz build artifacts',
		icon: 'trash',
		command: 'latex-studio.clean'
	},
	{
		label: 'Check TeX Environment',
		description: 'Detect installed TeX Live, MiKTeX, and MacTeX toolchains',
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
