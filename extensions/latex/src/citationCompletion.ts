/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { BibEntry, BibIndexer } from './bibIndexer.ts';

export class CitationCompletionProvider implements vscode.CompletionItemProvider {
	private static readonly CITE_REGEX = /\\(cite[a-zA-Z*]*|nocite)\{([^}]*)$/;

	public provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		_token: vscode.CancellationToken,
		_context: vscode.CompletionContext
	): vscode.ProviderResult<vscode.CompletionItem[]> {
		const config = vscode.workspace.getConfiguration('latex-studio');
		const enabled = config.get<boolean>('citation.autocomplete.enabled', true);
		if (!enabled) {
			return null;
		}

		const linePrefix = document.lineAt(position.line).text.substring(0, position.character);
		const match = linePrefix.match(CitationCompletionProvider.CITE_REGEX);
		if (!match) {
			return null;
		}

		const entries = BibIndexer.getInstance().getAllEntries();
		return entries.map((entry) => this.createCompletionItem(entry));
	}

	private createCompletionItem(entry: BibEntry): vscode.CompletionItem {
		const item = new vscode.CompletionItem(entry.key, vscode.CompletionItemKind.Reference);

		const authorSummary = entry.author ? (entry.author.length > 35 ? entry.author.substring(0, 32) + '...' : entry.author) : 'Unknown Author';
		const yearStr = entry.year ? `[${entry.year}]` : '';
		item.detail = `${yearStr} ${authorSummary} — ${entry.title || 'Untitled'}`;

		// Enable fuzzy search by key, authors, title, or year
		item.filterText = `${entry.key} ${entry.author || ''} ${entry.title || ''} ${entry.year || ''}`;

		const doc = new vscode.MarkdownString();
		doc.appendMarkdown(`### 📚 ${entry.title || entry.key}\n\n`);
		if (entry.author) {
			doc.appendMarkdown(`**Authors:** ${entry.author}\n\n`);
		}
		const venue = entry.journal || entry.booktitle || entry.publisher;
		if (venue) {
			doc.appendMarkdown(`**Venue:** *${venue}* (${entry.year || 'n.d.'})\n\n`);
		}
		if (entry.doi) {
			doc.appendMarkdown(`**DOI:** [${entry.doi}](https://doi.org/${entry.doi})\n\n`);
		}
		if (entry.abstract) {
			const abs = entry.abstract.length > 250 ? entry.abstract.substring(0, 247) + '...' : entry.abstract;
			doc.appendMarkdown(`> ${abs}\n\n`);
		}
		doc.appendMarkdown(`*Source: ${entry.filePath}*`);

		item.documentation = doc;
		item.insertText = entry.key;

		return item;
	}
}
