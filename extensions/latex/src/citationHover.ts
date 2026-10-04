/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { BibIndexer } from './bibIndexer.ts';

export class CitationHoverProvider implements vscode.HoverProvider {
	private static readonly CITE_IN_LINE_REGEX = /\\(cite[a-zA-Z*]*|nocite)\{([^}]+)\}/g;

	public provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		_token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Hover> {
		const config = vscode.workspace.getConfiguration('latex-studio');
		const enabled = config.get<boolean>('citation.hover.enabled', true);
		if (!enabled) {
			return null;
		}

		const lineText = document.lineAt(position.line).text;
		const charIdx = position.character;

		let match: RegExpExecArray | null;
		CitationHoverProvider.CITE_IN_LINE_REGEX.lastIndex = 0;

		while ((match = CitationHoverProvider.CITE_IN_LINE_REGEX.exec(lineText)) !== null) {
			const fullMatchStart = match.index;
			const fullMatchEnd = fullMatchStart + match[0].length;

			if (charIdx >= fullMatchStart && charIdx <= fullMatchEnd) {
				const keysStr = match[2];
				const keys = keysStr.split(',').map((k) => k.trim());

				// Check which specific key is hovered
				let cursorOffsetInKeys = charIdx - (fullMatchStart + match[0].indexOf('{') + 1);
				let currentPos = 0;
				let activeKey: string | null = null;
				let keyRange: vscode.Range | null = null;

				for (const k of keys) {
					const kStart = currentPos;
					const kEnd = currentPos + k.length;
					if (cursorOffsetInKeys >= kStart && cursorOffsetInKeys <= kEnd) {
						activeKey = k;
						const docKStart = fullMatchStart + match[0].indexOf('{') + 1 + kStart;
						keyRange = new vscode.Range(position.line, docKStart, position.line, docKStart + k.length);
						break;
					}
					currentPos += k.length + 1; // plus comma
				}

				if (!activeKey) {
					activeKey = keys[0];
					keyRange = new vscode.Range(position.line, fullMatchStart, position.line, fullMatchEnd);
				}

				const entry = BibIndexer.getInstance().getEntry(activeKey);
				const md = new vscode.MarkdownString();
				md.isTrusted = true;

				if (entry) {
					md.appendMarkdown(`### 📚 Citation: \`${entry.key}\` \`[@${entry.type}]\`\n\n`);
					if (entry.title) {
						md.appendMarkdown(`**"${entry.title}"**\n\n`);
					}
					if (entry.author) {
						md.appendMarkdown(`**Authors:** ${entry.author}\n\n`);
					}
					const venue = entry.journal || entry.booktitle || entry.publisher;
					if (venue || entry.year) {
						md.appendMarkdown(`**Published:** *${venue || 'N/A'}* (${entry.year || 'n.d.'})\n\n`);
					}
					if (entry.doi) {
						md.appendMarkdown(`**DOI:** [${entry.doi}](https://doi.org/${entry.doi})\n\n`);
					}
					if (entry.abstract) {
						const abs = entry.abstract.length > 250 ? entry.abstract.substring(0, 247) + '...' : entry.abstract;
						md.appendMarkdown(`> ${abs}\n\n`);
					}
					md.appendMarkdown(`---\n*Source: \`${entry.filePath}\`*`);
				} else {
					md.appendMarkdown(`⚠️ **Citation Warning**: Key \`${activeKey}\` not found in workspace \`.bib\` files.\n\n`);
					md.appendMarkdown(`Ensure your bibliography database has an entry for \`@...{${activeKey}, ...}\`.`);
				}

				return new vscode.Hover(md, keyRange || undefined);
			}
		}

		return null;
	}
}
