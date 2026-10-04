/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { MathExtractor } from './mathExtractor.ts';

export class MathHoverProvider implements vscode.HoverProvider {
	public provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		_token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Hover> {
		const config = vscode.workspace.getConfiguration('latex-studio');
		const enabled = config.get<boolean>('hover.mathPreview.enabled', true);
		if (!enabled) {
			return null;
		}

		const extracted = MathExtractor.extractAt(document, position);
		if (!extracted) {
			return null;
		}

		const md = new vscode.MarkdownString();
		md.isTrusted = true;
		md.supportHtml = true;

		const typeLabel =
			extracted.type === 'environment'
				? `Environment: \\\\${extracted.environmentName}`
				: extracted.type === 'display'
				? 'Display Math'
				: 'Inline Math';

		md.appendMarkdown(`**📐 LaTeX Studio — Math Preview** \`[${typeLabel}]\`\n\n`);

		// Render the formula with $$ blocks so VS Code / Monaco renders it with KaTeX
		// Clean out \\label{...} for rendering to avoid KaTeX parsing errors
		const cleanMathCode = extracted.mathCode.replace(/\\label\{[^}]*\}/g, '').trim();

		md.appendMarkdown(`$$\n${cleanMathCode}\n$$\n\n`);
		md.appendMarkdown(`---\n`);
		md.appendMarkdown(
			`[▶️ Compile Document](command:latex-studio.build) &nbsp;&nbsp;|&nbsp;&nbsp; [📖 View PDF](command:latex-studio.viewPdf)`
		);

		return new vscode.Hover(md, extracted.range);
	}
}
