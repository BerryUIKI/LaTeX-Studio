/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export interface OutlineNode {
	level: number;
	title: string;
	line: number;
	children: OutlineNode[];
}

const SECTION_LEVELS: { [key: string]: number } = {
	part: 0,
	chapter: 1,
	section: 2,
	subsection: 3,
	subsubsection: 4,
	paragraph: 5
};

export class OutlineTreeItem extends vscode.TreeItem {
	constructor(public readonly node: OutlineNode) {
		const hasChildren = node.children.length > 0;
		super(
			node.title,
			hasChildren ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
		);
		this.description = `L${node.line + 1}`;
		this.tooltip = `${node.title} (Line ${node.line + 1})`;
		this.iconPath = this.getIconForLevel(node.level);

		this.command = {
			command: 'latex-studio.jumpToLine',
			title: 'Jump to Section',
			arguments: [node.line]
		};
	}

	private getIconForLevel(level: number): vscode.ThemeIcon {
		switch (level) {
			case 0:
			case 1:
				return new vscode.ThemeIcon('repo');
			case 2:
				return new vscode.ThemeIcon('bookmark');
			case 3:
				return new vscode.ThemeIcon('symbol-class');
			default:
				return new vscode.ThemeIcon('symbol-field');
		}
	}
}

export class OutlineProvider implements vscode.TreeDataProvider<OutlineTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<OutlineTreeItem | undefined | null | void> = new vscode.EventEmitter<OutlineTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<OutlineTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	private rootNodes: OutlineNode[] = [];

	constructor() {
		this.updateOutline();
	}

	refresh(): void {
		this.updateOutline();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: OutlineTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: OutlineTreeItem): Thenable<OutlineTreeItem[]> {
		if (!element) {
			return Promise.resolve(this.rootNodes.map((node) => new OutlineTreeItem(node)));
		} else {
			return Promise.resolve(element.node.children.map((child) => new OutlineTreeItem(child)));
		}
	}

	public updateOutline(): void {
		const editor = vscode.window.activeTextEditor;
		if (!editor || (editor.document.languageId !== 'latex' && editor.document.languageId !== 'tex')) {
			this.rootNodes = [];
			return;
		}

		const text = editor.document.getText();
		const lines = text.split(/\r?\n/);
		const regex = /\\(part|chapter|section|subsection|subsubsection|paragraph)\*?\{([^}]+)\}/;

		const flatNodes: OutlineNode[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const match = line.match(regex);
			if (match) {
				const tag = match[1];
				const title = match[2].trim();
				const level = SECTION_LEVELS[tag] ?? 2;
				flatNodes.push({
					level,
					title,
					line: i,
					children: []
				});
			}
		}

		// Build tree from flatNodes based on level
		const roots: OutlineNode[] = [];
		const stack: OutlineNode[] = [];

		for (const node of flatNodes) {
			while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
				stack.pop();
			}

			if (stack.length === 0) {
				roots.push(node);
			} else {
				stack[stack.length - 1].children.push(node);
			}

			stack.push(node);
		}

		this.rootNodes = roots;
	}
}
