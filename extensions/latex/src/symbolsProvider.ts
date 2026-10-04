/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

interface SymbolItem {
	char: string;
	latex: string;
	description?: string;
}

interface SymbolCategory {
	name: string;
	symbols: SymbolItem[];
}

const SYMBOL_CATEGORIES: SymbolCategory[] = [
	{
		name: 'Greek Letters (小写希腊字母)',
		symbols: [
			{ char: 'α', latex: '\\alpha' },
			{ char: 'β', latex: '\\beta' },
			{ char: 'γ', latex: '\\gamma' },
			{ char: 'δ', latex: '\\delta' },
			{ char: 'ϵ', latex: '\\epsilon' },
			{ char: 'ε', latex: '\\varepsilon' },
			{ char: 'ζ', latex: '\\zeta' },
			{ char: 'η', latex: '\\eta' },
			{ char: 'θ', latex: '\\theta' },
			{ char: 'ϑ', latex: '\\vartheta' },
			{ char: 'ι', latex: '\\iota' },
			{ char: 'κ', latex: '\\kappa' },
			{ char: 'λ', latex: '\\lambda' },
			{ char: 'μ', latex: '\\mu' },
			{ char: 'ν', latex: '\\nu' },
			{ char: 'ξ', latex: '\\xi' },
			{ char: 'π', latex: '\\pi' },
			{ char: 'ϖ', latex: '\\varpi' },
			{ char: 'ρ', latex: '\\rho' },
			{ char: 'ϱ', latex: '\\varrho' },
			{ char: 'σ', latex: '\\sigma' },
			{ char: 'ς', latex: '\\varsigma' },
			{ char: 'τ', latex: '\\tau' },
			{ char: 'υ', latex: '\\upsilon' },
			{ char: 'ϕ', latex: '\\phi' },
			{ char: 'φ', latex: '\\varphi' },
			{ char: 'χ', latex: '\\chi' },
			{ char: 'ψ', latex: '\\psi' },
			{ char: 'ω', latex: '\\omega' }
		]
	},
	{
		name: 'Greek Uppercase (大写希腊字母)',
		symbols: [
			{ char: 'Γ', latex: '\\Gamma' },
			{ char: 'Δ', latex: '\\Delta' },
			{ char: 'Θ', latex: '\\Theta' },
			{ char: 'Λ', latex: '\\Lambda' },
			{ char: 'Ξ', latex: '\\Xi' },
			{ char: 'Π', latex: '\\Pi' },
			{ char: 'Σ', latex: '\\Sigma' },
			{ char: 'Υ', latex: '\\Upsilon' },
			{ char: 'Φ', latex: '\\Phi' },
			{ char: 'Ψ', latex: '\\Psi' },
			{ char: 'Ω', latex: '\\Omega' }
		]
	},
	{
		name: 'Operators & Sets (运算与集合)',
		symbols: [
			{ char: '±', latex: '\\pm' },
			{ char: '∓', latex: '\\mp' },
			{ char: '×', latex: '\\times' },
			{ char: '÷', latex: '\\div' },
			{ char: '·', latex: '\\cdot' },
			{ char: '∈', latex: '\\in' },
			{ char: '∉', latex: '\\notin' },
			{ char: '⊂', latex: '\\subset' },
			{ char: '⊆', latex: '\\subseteq' },
			{ char: '∩', latex: '\\cap' },
			{ char: '∪', latex: '\\cup' },
			{ char: '∅', latex: '\\emptyset' },
			{ char: '∀', latex: '\\forall' },
			{ char: '∃', latex: '\\exists' }
		]
	},
	{
		name: 'Relations (关系与比较)',
		symbols: [
			{ char: '≤', latex: '\\leq' },
			{ char: '≥', latex: '\\geq' },
			{ char: '≠', latex: '\\neq' },
			{ char: '≈', latex: '\\approx' },
			{ char: '≡', latex: '\\equiv' },
			{ char: '∼', latex: '\\sim' },
			{ char: '∝', latex: '\\propto' },
			{ char: '≪', latex: '\\ll' },
			{ char: '≫', latex: '\\gg' },
			{ char: '⊥', latex: '\\perp' }
		]
	},
	{
		name: 'Arrows (箭头与映射)',
		symbols: [
			{ char: '←', latex: '\\leftarrow' },
			{ char: '→', latex: '\\rightarrow' },
			{ char: '↔', latex: '\\leftrightarrow' },
			{ char: '⇐', latex: '\\Leftarrow' },
			{ char: '⇒', latex: '\\Rightarrow' },
			{ char: '⇔', latex: '\\Leftrightarrow' },
			{ char: '↦', latex: '\\mapsto' },
			{ char: '↑', latex: '\\uparrow' },
			{ char: '↓', latex: '\\downarrow' }
		]
	},
	{
		name: 'Calculus & Advanced (微积分与高级算子)',
		symbols: [
			{ char: '∑', latex: '\\sum_{i=1}^{n}' },
			{ char: '∏', latex: '\\prod_{i=1}^{n}' },
			{ char: '∫', latex: '\\int' },
			{ char: '∬', latex: '\\iint' },
			{ char: '∮', latex: '\\oint' },
			{ char: '∂', latex: '\\partial' },
			{ char: '∇', latex: '\\nabla' },
			{ char: '∞', latex: '\\infty' },
			{ char: 'lim', latex: '\\lim_{x \\to 0}' },
			{ char: '√', latex: '\\sqrt{x}' }
		]
	}
];

export class SymbolTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly latexCode?: string,
		public readonly category?: SymbolCategory
	) {
		super(label, collapsibleState);
		if (latexCode) {
			this.description = latexCode;
			this.tooltip = `点击插入: ${latexCode}`;
			this.command = {
				command: 'latex-studio.insertSnippet',
				title: 'Insert Symbol',
				arguments: [latexCode]
			};
		}
	}
}

export class SymbolsProvider implements vscode.TreeDataProvider<SymbolTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<SymbolTreeItem | undefined | null | void> = new vscode.EventEmitter<SymbolTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<SymbolTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: SymbolTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: SymbolTreeItem): Thenable<SymbolTreeItem[]> {
		if (!element) {
			// Top level: categories
			const categoryItems = SYMBOL_CATEGORIES.map(
				(cat) => new SymbolTreeItem(cat.name, vscode.TreeItemCollapsibleState.Collapsed, undefined, cat)
			);
			return Promise.resolve(categoryItems);
		} else if (element.category) {
			// Second level: symbols in category
			const symbolItems = element.category.symbols.map(
				(sym) => new SymbolTreeItem(`${sym.char}  ${sym.latex}`, vscode.TreeItemCollapsibleState.None, sym.latex)
			);
			return Promise.resolve(symbolItems);
		}

		return Promise.resolve([]);
	}
}
