/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface BibEntry {
	key: string;
	type: string;
	title?: string;
	author?: string;
	year?: string;
	journal?: string;
	booktitle?: string;
	publisher?: string;
	doi?: string;
	url?: string;
	abstract?: string;
	filePath: string;
}

export class BibIndexer {
	private static instance: BibIndexer;
	private entriesMap = new Map<string, BibEntry>();
	private watcher?: vscode.FileSystemWatcher;

	public static getInstance(): BibIndexer {
		if (!this.instance) {
			this.instance = new BibIndexer();
		}
		return this.instance;
	}

	public initialize(context: vscode.ExtensionContext): void {
		this.reindexWorkspace();

		this.watcher = vscode.workspace.createFileSystemWatcher('**/*.bib');
		this.watcher.onDidChange((uri) => this.parseFile(uri.fsPath));
		this.watcher.onDidCreate((uri) => this.parseFile(uri.fsPath));
		this.watcher.onDidDelete((uri) => this.removeFileEntries(uri.fsPath));

		context.subscriptions.push(this.watcher);
	}

	public async reindexWorkspace(): Promise<void> {
		this.entriesMap.clear();

		// Find all .bib files in workspace
		const bibUris = await vscode.workspace.findFiles('**/*.bib', '**/node_modules/**');
		for (const uri of bibUris) {
			await this.parseFile(uri.fsPath);
		}

		// Also check active document directory
		if (vscode.window.activeTextEditor) {
			const activeDir = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
			try {
				const files = await fs.promises.readdir(activeDir);
				for (const f of files) {
					if (f.endsWith('.bib')) {
						await this.parseFile(path.join(activeDir, f));
					}
				}
			} catch {
				// ignore
			}
		}
	}

	public getEntry(key: string): BibEntry | undefined {
		return this.entriesMap.get(key.trim());
	}

	public getAllEntries(): BibEntry[] {
		return Array.from(this.entriesMap.values());
	}

	public async parseFile(filePath: string): Promise<void> {
		try {
			const content = await fs.promises.readFile(filePath, 'utf8');
			this.removeFileEntries(filePath);

			const parsed = this.parseBibTeX(content, filePath);
			for (const entry of parsed) {
				this.entriesMap.set(entry.key, entry);
			}
		} catch {
			// ignore read errors
		}
	}

	private removeFileEntries(filePath: string): void {
		for (const [key, entry] of this.entriesMap.entries()) {
			if (entry.filePath === filePath) {
				this.entriesMap.delete(key);
			}
		}
	}

	private parseBibTeX(text: string, filePath: string): BibEntry[] {
		const entries: BibEntry[] = [];
		const entryHeaderRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,/g;
		let match: RegExpExecArray | null;

		while ((match = entryHeaderRegex.exec(text)) !== null) {
			const type = match[1].toLowerCase();
			const key = match[2].trim();
			const startIdx = match.index + match[0].length;

			// Find closing brace matching the opening brace
			let braceCount = 1;
			let endIdx = startIdx;
			for (let i = startIdx; i < text.length; i++) {
				if (text[i] === '{') {
					braceCount++;
				} else if (text[i] === '}') {
					braceCount--;
					if (braceCount === 0) {
						endIdx = i;
						break;
					}
				}
			}

			const body = text.substring(startIdx, endIdx);
			const fields = this.parseFields(body);

			entries.push({
				key,
				type,
				title: fields['title'],
				author: fields['author'],
				year: fields['year'],
				journal: fields['journal'],
				booktitle: fields['booktitle'],
				publisher: fields['publisher'],
				doi: fields['doi'],
				url: fields['url'],
				abstract: fields['abstract'],
				filePath
			});
		}

		return entries;
	}

	private parseFields(body: string): { [key: string]: string } {
		const fields: { [key: string]: string } = {};
		const fieldRegex = /([a-zA-Z]+)\s*=\s*([{\"][^}\"]*[}\"]|\d+|[a-zA-Z0-9_-]+)/g;
		let match: RegExpExecArray | null;

		while ((match = fieldRegex.exec(body)) !== null) {
			const key = match[1].toLowerCase();
			let val = match[2].trim();
			if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('"') && val.endsWith('"'))) {
				val = val.substring(1, val.length - 1).trim();
			}
			// Clean inner LaTeX formatting like \textbf or {Word}
			val = val.replace(/[{}]/g, '').replace(/\\&/g, '&');
			fields[key] = val;
		}

		return fields;
	}
}
