/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export interface SyncTeXForwardResult {
	page: number;
	x: number;
	y: number;
}

export interface SyncTeXInverseResult {
	file: string;
	line: number;
}

export class SyncTeXManager {
	public static async forwardSync(
		texFile: string,
		line: number,
		pdfPath: string
	): Promise<SyncTeXForwardResult | null> {
		const dir = path.dirname(texFile);
		const baseTex = path.basename(texFile);

		return new Promise((resolve) => {
			const cmd = `synctex view -i "${line}:0:${baseTex}" -o "${pdfPath}"`;
			cp.exec(cmd, { cwd: dir }, (err, stdout) => {
				if (err || !stdout) {
					resolve(null);
					return;
				}

				const pageMatch = stdout.match(/Page:\s*(\d+)/i);
				const xMatch = stdout.match(/x:\s*([\d.]+)/i);
				const yMatch = stdout.match(/y:\s*([\d.]+)/i);

				if (pageMatch) {
					const page = parseInt(pageMatch[1], 10);
					const x = xMatch ? parseFloat(xMatch[1]) : 0;
					const y = yMatch ? parseFloat(yMatch[1]) : 0;
					resolve({ page, x, y });
				} else {
					resolve(null);
				}
			});
		});
	}

	public static async inverseSync(
		pdfPath: string,
		page: number,
		x: number,
		y: number
	): Promise<SyncTeXInverseResult | null> {
		const dir = path.dirname(pdfPath);

		return new Promise((resolve) => {
			const cmd = `synctex edit -o "${page}:${x}:${y}:${pdfPath}"`;
			cp.exec(cmd, { cwd: dir }, (err, stdout) => {
				if (err || !stdout) {
					resolve(null);
					return;
				}

				const inputMatch = stdout.match(/Input:\s*([^\r\n]+)/i);
				const lineMatch = stdout.match(/Line:\s*(\d+)/i);

				if (inputMatch && lineMatch) {
					const rawFile = inputMatch[1].trim();
					const resolvedFile = path.isAbsolute(rawFile) ? rawFile : path.resolve(dir, rawFile);
					const line = parseInt(lineMatch[1], 10);
					resolve({ file: resolvedFile, line });
				} else {
					resolve(null);
				}
			});
		});
	}

	public static async jumpToSource(result: SyncTeXInverseResult): Promise<void> {
		try {
			const uri = vscode.Uri.file(result.file);
			const doc = await vscode.workspace.openTextDocument(uri);
			const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
			const targetLine = Math.max(0, result.line - 1);
			const pos = new vscode.Position(targetLine, 0);
			editor.selection = new vscode.Selection(pos, pos);
			editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
		} catch (err) {
			vscode.window.showErrorMessage(`LaTeX Studio: Could not open source file - ${(err as Error).message}`);
		}
	}
}
