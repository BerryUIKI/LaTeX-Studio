/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface ToolchainStatus {
	xelatex: boolean;
	pdflatex: boolean;
	lualatex: boolean;
	latexmk: boolean;
	bibtex: boolean;
	biber: boolean;
}

export class TeXDetector {
	private static cachedStatus: ToolchainStatus | null = null;

	public static async detect(): Promise<ToolchainStatus> {
		if (this.cachedStatus) {
			return this.cachedStatus;
		}

		const tools = ['xelatex', 'pdflatex', 'lualatex', 'latexmk', 'bibtex', 'biber'] as const;
		const results: Partial<ToolchainStatus> = {};

		await Promise.all(
			tools.map(async (tool) => {
				const available = await this.isCommandAvailable(tool);
				results[tool] = available;
			})
		);

		this.cachedStatus = results as ToolchainStatus;
		return this.cachedStatus;
	}

	public static async isCommandAvailable(command: string): Promise<boolean> {
		return new Promise((resolve) => {
			const checkCmd = process.platform === 'win32' ? 'where' : 'which';
			cp.exec(`${checkCmd} ${command}`, (err, stdout) => {
				if (!err && stdout.trim().length > 0) {
					resolve(true);
					return;
				}

				// Fallback: check common paths
				const commonPaths = this.getCommonPaths();
				const ext = process.platform === 'win32' ? '.exe' : '';
				for (const dir of commonPaths) {
					const fullPath = path.join(dir, command + ext);
					if (fs.existsSync(fullPath)) {
						resolve(true);
						return;
					}
				}

				resolve(false);
			});
		});
	}

	private static getCommonPaths(): string[] {
		const dirs: string[] = [];
		if (process.platform === 'win32') {
			// TeX Live default paths
			const systemDrive = process.env.SystemDrive || 'C:';
			const currentYear = new Date().getFullYear();
			for (let year = currentYear + 1; year >= 2020; year--) {
				dirs.push(path.join(systemDrive, 'texlive', String(year), 'bin', 'windows'));
				dirs.push(path.join(systemDrive, 'texlive', String(year), 'bin', 'win32'));
			}
			// MiKTeX paths
			const progFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
			dirs.push(path.join(progFiles, 'MiKTeX', 'miktex', 'bin', 'x64'));
			const localAppData = process.env['LOCALAPPDATA'];
			if (localAppData) {
				dirs.push(path.join(localAppData, 'Programs', 'MiKTeX', 'miktex', 'bin', 'x64'));
			}
			// TinyTeX
			const appData = process.env['APPDATA'];
			if (appData) {
				dirs.push(path.join(appData, 'TinyTeX', 'bin', 'windows'));
			}
		} else if (process.platform === 'darwin') {
			dirs.push('/Library/TeX/texbin', '/usr/local/bin', '/opt/homebrew/bin');
		} else {
			dirs.push('/usr/bin', '/usr/local/bin');
		}
		return dirs;
	}

	public static clearCache(): void {
		this.cachedStatus = null;
	}
}
