/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export interface TeXErrorExplanation {
	pattern: RegExp | string;
	title: string;
	cause: string;
	suggestion: string;
	fixAction?: (document: vscode.TextDocument, range: vscode.Range) => vscode.CodeAction | undefined;
}

/**
 * Intelligent TeX Error Explainer & Diagnostic CodeAction Provider
 * Translates cryptic compiler errors into plain English explanations with quick fixes.
 */
export class ErrorExplainer {
	public static readonly EXPLANATIONS: TeXErrorExplanation[] = [
		{
			pattern: /Missing \$ inserted/i,
			title: 'Missing Math Delimiter ($)',
			cause: 'A mathematical symbol or command (e.g., \\alpha, _, ^) was used in text mode outside a math environment ($...$, \\[...\\], or equation).',
			suggestion: 'Wrap the expression with dollar signs `$ ... $` or enclose it in an equation environment.'
		},
		{
			pattern: /Undefined control sequence/i,
			title: 'Undefined Control Sequence (Macro not found)',
			cause: 'TeX encountered an unrecognized command or macro name. Usually caused by a typo or missing package in \\usepackage{...}.',
			suggestion: 'Verify the spelling of the command or import the necessary package (e.g. \\usepackage{amsmath}, \\usepackage{graphicx}).'
		},
		{
			pattern: /LaTeX Error: File `(.*?)' not found/i,
			title: 'Missing Package or File',
			cause: 'A required style package, bibliography file, or graphic asset could not be located in the project directory or TeX distribution path.',
			suggestion: 'Install the missing package via your TeX package manager (tlmgr or MiKTeX Console) or check the file name and path.'
		},
		{
			pattern: /LaTeX Error: \\begin\{(.*?)\} on input line (\d+) ended by \\end\{(.*?)\}/i,
			title: 'Mismatched Environment Tag',
			cause: 'An environment was opened with one name but closed with a different name or left unclosed.',
			suggestion: 'Check your nested \\begin{...} and \\end{...} tags to ensure they match and are closed in reverse order.'
		},
		{
			pattern: /Emergency stop/i,
			title: 'TeX Engine Emergency Stop',
			cause: 'The compiler terminated abruptly, typically due to a fatal missing input file or syntax loop in batch mode.',
			suggestion: 'Check earlier error messages in the build log to identify the root syntax error or missing file.'
		},
		{
			pattern: /Extra \}, or forgotten \$/i,
			title: 'Unbalanced Brace or Delimiter',
			cause: 'A closing brace `}` was encountered without a matching opening brace `{`, or a math mode block ended unexpectedly.',
			suggestion: 'Check the balance of `{` and `}` delimiters in the affected paragraph.'
		},
		{
			pattern: /LaTeX Error: Can be used only in preamble/i,
			title: 'Preamble-only Command in Document Body',
			cause: 'A configuration macro (such as \\usepackage or \\hypersetup) was called after \\begin{document}.',
			suggestion: 'Move the command before \\begin{document} in the preamble section.'
		},
		{
			pattern: /LaTeX Error: Command (.*?) already defined/i,
			title: 'Command Collision (Already Defined)',
			cause: 'Attempted to define a macro with \\newcommand that already exists in LaTeX kernel or an imported package.',
			suggestion: 'Use \\renewcommand instead of \\newcommand, or choose a distinct macro name.'
		},
		{
			pattern: /Overfull \\hbox/i,
			title: 'Overfull Horizontal Box (Margin Overflow)',
			cause: 'A line of text, math expression, or table row is too wide to fit within the page margins.',
			suggestion: 'Reword the sentence, add hyphenation points (\\-), or resize oversized inline equations/tables.'
		},
		{
			pattern: /Underfull \\hbox/i,
			title: 'Underfull Horizontal Box (Loose Spacing)',
			cause: 'LaTeX had to stretch the spaces between words too far to justify the line, usually caused by manual line breaks (`\\\\`).',
			suggestion: 'Avoid manual line breaks (`\\\\`) in paragraph text; use blank lines for new paragraphs instead.'
		}
	];

	public static explain(message: string): TeXErrorExplanation | undefined {
		for (const item of this.EXPLANATIONS) {
			if (typeof item.pattern === 'string') {
				if (message.toLowerCase().includes(item.pattern.toLowerCase())) {
					return item;
				}
			} else {
				if (item.pattern.test(message)) {
					return item;
				}
			}
		}
		return undefined;
	}
}

/**
 * Diagnostic Code Actions for LaTeX errors
 */
export class LaTeXCodeActionProvider implements vscode.CodeActionProvider {
	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext
	): vscode.CodeAction[] {
		const actions: vscode.CodeAction[] = [];

		for (const diagnostic of context.diagnostics) {
			if (diagnostic.source !== 'LaTeX Studio') {
				continue;
			}

			const explanation = ErrorExplainer.explain(diagnostic.message);
			if (explanation) {
				// 1. Informational QuickFix explaining the error
				const explainAction = new vscode.CodeAction(
					`💡 Why this error: ${explanation.title}`,
					vscode.CodeActionKind.QuickFix
				);
				explainAction.diagnostics = [diagnostic];
				explainAction.isPreferred = false;
				explainAction.command = {
					command: 'latex-studio.showErrorExplanation',
					title: 'Show Error Explanation',
					arguments: [diagnostic.message, explanation]
				};
				actions.push(explainAction);

				// 2. Wrap in $ ... $ for Missing $ inserted
				if (/Missing \$ inserted/i.test(diagnostic.message)) {
					const lineText = document.lineAt(range.start.line).text;
					const wrapAction = new vscode.CodeAction(
						`🔧 Wrap selection in inline math ($...$)`,
						vscode.CodeActionKind.QuickFix
					);
					wrapAction.diagnostics = [diagnostic];
					wrapAction.isPreferred = true;
					const edit = new vscode.WorkspaceEdit();
					if (range.isEmpty) {
						// Wrap whole line or cursor word
						const wordRange = document.getWordRangeAtPosition(range.start);
						if (wordRange) {
							edit.replace(document.uri, wordRange, `$${document.getText(wordRange)}$`);
						}
					} else {
						edit.replace(document.uri, range, `$${document.getText(range)}$`);
					}
					wrapAction.edit = edit;
					actions.push(wrapAction);
				}

				// 3. Fix manual line breaks for Underfull \hbox
				if (/Underfull \\hbox/i.test(diagnostic.message)) {
					const lineText = document.lineAt(range.start.line).text;
					if (lineText.includes('\\\\')) {
						const fixBreakAction = new vscode.CodeAction(
							`🔧 Replace manual line break (\\\\) with paragraph break`,
							vscode.CodeActionKind.QuickFix
						);
						fixBreakAction.diagnostics = [diagnostic];
						fixBreakAction.isPreferred = true;
						const edit = new vscode.WorkspaceEdit();
						const newLineText = lineText.replace(/\\\\\s*$/, '\n\n');
						edit.replace(document.uri, document.lineAt(range.start.line).range, newLineText);
						fixBreakAction.edit = edit;
						actions.push(fixBreakAction);
					}
				}
			}
		}

		return actions;
	}
}
