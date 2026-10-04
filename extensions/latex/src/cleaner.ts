/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export const AUXILIARY_EXTENSIONS = [
	'.aux',
	'.log',
	'.synctex.gz',
	'.fls',
	'.fdb_latexmk',
	'.toc',
	'.bbl',
	'.blg',
	'.out',
	'.nav',
	'.snm',
	'.vrb',
	'.run.xml',
	'.bcf',
	'.idx',
	'.ilg',
	'.ind',
	'.lot',
	'.lof',
	'.xdv',
	'.dvi',
	'.maf',
	'.mtc',
	'.mtc0'
];

export class LaTeXCleaner {
	public static async clean(texFileUri?: vscode.Uri): Promise<number> {
		let targetDir: string | null = null;
		let baseName: string | null = null;

		if (texFileUri) {
			targetDir = path.dirname(texFileUri.fsPath);
			baseName = path.basename(texFileUri.fsPath, path.extname(texFileUri.fsPath));
		} else if (vscode.window.activeTextEditor) {
			const activePath = vscode.window.activeTextEditor.document.uri.fsPath;
			targetDir = path.dirname(activePath);
			baseName = path.basename(activePath, path.extname(activePath));
		} else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			targetDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
		}

		if (!targetDir) {
			vscode.window.showWarningMessage('No active LaTeX project or file to clean.');
			return 0;
		}

		let deletedCount = 0;
		try {
			const files = await fs.promises.readdir(targetDir);
			for (const file of files) {
				const ext = path.extname(file).toLowerCase();
				const isGz = file.endsWith('.synctex.gz');
				if (AUXILIARY_EXTENSIONS.includes(ext) || isGz) {
					// If baseName is known, only delete matching files or all auxiliary files
					if (!baseName || file.startsWith(baseName)) {
						const filePath = path.join(targetDir, file);
						try {
							await fs.promises.unlink(filePath);
							deletedCount++;
						} catch {
							// ignore permission errors on individual files
						}
					}
				}
			}

			vscode.window.showInformationMessage(`LaTeX Studio: Cleaned ${deletedCount} auxiliary files.`);
		} catch (err) {
			vscode.window.showErrorMessage(`LaTeX Studio: Failed to clean files - ${(err as Error).message}`);
		}

		return deletedCount;
	}
}
