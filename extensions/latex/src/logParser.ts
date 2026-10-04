/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as vscode from 'vscode';

export class LaTeXLogParser {
	private diagnostics: vscode.DiagnosticCollection;

	constructor() {
		this.diagnostics = vscode.languages.createDiagnosticCollection('LaTeX Studio');
	}

	public parse(log: string, rootDir: string): void {
		this.diagnostics.clear();

		const lines = log.split(/\r?\n/);
		const fileDiagnosticsMap = new Map<string, vscode.Diagnostic[]>();

		const addDiag = (filePath: string, diag: vscode.Diagnostic) => {
			const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(rootDir, filePath);
			const uri = vscode.Uri.file(resolvedPath).toString();
			if (!fileDiagnosticsMap.has(uri)) {
				fileDiagnosticsMap.set(uri, []);
			}
			fileDiagnosticsMap.get(uri)!.push(diag);
		};

		// Regex pattern for -file-line-error: file.tex:line: message
		const fileLineErrorRegex = /^([^:\n\r]+):(\d+):\s*(.*)$/;
		// Regex for LaTeX warnings: LaTeX Warning: ... on input line 42.
		const warningRegex = /LaTeX Warning:\s*(.+?)(?: on input line (\d+))?\./i;
		// Regex for Badbox: Overfull / Underfull \hbox (...) in paragraph at lines 10--20
		const badBoxRegex = /(Overfull|Underfull)\s*\\(hbox|vbox)\s*\((.+?)\)\s*in paragraph at lines (\d+)--(\d+)/i;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			// 1. Check file-line-error format
			const fileLineMatch = line.match(fileLineErrorRegex);
			if (fileLineMatch) {
				const relFile = fileLineMatch[1];
				const lineNum = Math.max(0, parseInt(fileLineMatch[2], 10) - 1);
				const message = fileLineMatch[3] || 'LaTeX Error';

				const range = new vscode.Range(lineNum, 0, lineNum, 1000);
				const diag = new vscode.Diagnostic(range, `[LaTeX] ${message}`, vscode.DiagnosticSeverity.Error);
				diag.source = 'LaTeX Studio';
				addDiag(relFile, diag);
				continue;
			}

			// 2. Check LaTeX Warnings
			const warnMatch = line.match(warningRegex);
			if (warnMatch) {
				const message = warnMatch[1];
				const lineNum = warnMatch[2] ? Math.max(0, parseInt(warnMatch[2], 10) - 1) : 0;
				// Try to deduce active file or use default document in editor
				const targetFile = vscode.window.activeTextEditor?.document.uri.fsPath || 'main.tex';
				const range = new vscode.Range(lineNum, 0, lineNum, 1000);
				const diag = new vscode.Diagnostic(range, `[Warning] ${message}`, vscode.DiagnosticSeverity.Warning);
				diag.source = 'LaTeX Studio';
				addDiag(targetFile, diag);
				continue;
			}

			// 3. Check BadBoxes (Overfull / Underfull)
			const badBoxMatch = line.match(badBoxRegex);
			if (badBoxMatch) {
				const type = badBoxMatch[1]; // Overfull or Underfull
				const box = badBoxMatch[2]; // hbox or vbox
				const details = badBoxMatch[3];
				const startLine = Math.max(0, parseInt(badBoxMatch[4], 10) - 1);
				const endLine = Math.max(0, parseInt(badBoxMatch[5], 10) - 1);

				const targetFile = vscode.window.activeTextEditor?.document.uri.fsPath || 'main.tex';
				const range = new vscode.Range(startLine, 0, endLine, 1000);
				const diag = new vscode.Diagnostic(
					range,
					`[${type} \\${box}] (${details})`,
					vscode.DiagnosticSeverity.Information
				);
				diag.source = 'LaTeX Studio';
				addDiag(targetFile, diag);
			}
		}

		// Apply diagnostics to collection
		for (const [uriStr, diagList] of fileDiagnosticsMap.entries()) {
			const uri = vscode.Uri.parse(uriStr);
			this.diagnostics.set(uri, diagList);
		}
	}

	public clear(): void {
		this.diagnostics.clear();
	}

	public dispose(): void {
		this.diagnostics.dispose();
	}
}
