/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { Recipe, DEFAULT_RECIPES } from './recipes.ts';

export interface BuildResult {
	success: boolean;
	pdfPath?: string;
	logContent: string;
	errorCount: number;
	warningCount: number;
}

export class LaTeXCompiler {
	private outputChannel: vscode.OutputChannel;
	private currentProcess: cp.ChildProcess | null = null;
	private isBuilding: boolean = false;
	private activeRecipeId: string = 'xelatex';

	private onBuildFinishedEmitter = new vscode.EventEmitter<BuildResult>();
	public readonly onBuildFinished = this.onBuildFinishedEmitter.event;

	private onBuildStatusChangedEmitter = new vscode.EventEmitter<boolean>();
	public readonly onBuildStatusChanged = this.onBuildStatusChangedEmitter.event;

	constructor() {
		this.outputChannel = vscode.window.createOutputChannel('LaTeX Studio Build');
	}

	public getActiveRecipe(): Recipe {
		const found = DEFAULT_RECIPES.find((r) => r.id === this.activeRecipeId);
		return found || DEFAULT_RECIPES[0];
	}

	public setActiveRecipe(recipeId: string): void {
		this.activeRecipeId = recipeId;
	}

	public get building(): boolean {
		return this.isBuilding;
	}

	public async build(targetUri?: vscode.Uri): Promise<BuildResult | null> {
		if (this.isBuilding) {
			vscode.window.showWarningMessage('LaTeX Studio: A build is already in progress.');
			return null;
		}

		let fileUri = targetUri;
		if (!fileUri && vscode.window.activeTextEditor) {
			fileUri = vscode.window.activeTextEditor.document.uri;
		}

		if (!fileUri || (!fileUri.fsPath.endsWith('.tex') && !fileUri.fsPath.endsWith('.ltx'))) {
			vscode.window.showErrorMessage('LaTeX Studio: Please open or select a valid .tex file to build.');
			return null;
		}

		const filePath = fileUri.fsPath;
		const dirName = path.dirname(filePath);
		const ext = path.extname(filePath);
		const baseName = path.basename(filePath, ext);
		const fileName = path.basename(filePath);
		const pdfPath = path.join(dirName, `${baseName}.pdf`);

		const recipe = this.getActiveRecipe();
		this.isBuilding = true;
		this.onBuildStatusChangedEmitter.fire(true);
		this.outputChannel.clear();
		this.outputChannel.show(true);
		this.outputChannel.appendLine(`=======================================================`);
		this.outputChannel.appendLine(`[LaTeX Studio] Starting build with recipe: ${recipe.label}`);
		this.outputChannel.appendLine(`[LaTeX Studio] File: ${filePath}`);
		this.outputChannel.appendLine(`[LaTeX Studio] Time: ${new Date().toLocaleTimeString()}`);
		this.outputChannel.appendLine(`=======================================================\n`);

		let totalLog = '';
		let success = true;

		for (let i = 0; i < recipe.tools.length; i++) {
			const step = recipe.tools[i];
			const command = step.command;
			const args = step.args.map((arg) => {
				return arg
					.replace(/%DOC%/g, fileName)
					.replace(/%DOC_BASE%/g, baseName)
					.replace(/%DIR%/g, dirName);
			});

			this.outputChannel.appendLine(`\n>>> [Step ${i + 1}/${recipe.tools.length}] ${command} ${args.join(' ')}\n`);

			const code = await new Promise<number>((resolve) => {
				try {
					const proc = cp.spawn(command, args, {
						cwd: dirName,
						shell: process.platform === 'win32'
					});
					this.currentProcess = proc;

					proc.stdout?.on('data', (data) => {
						const str = data.toString();
						totalLog += str;
						this.outputChannel.append(str);
					});

					proc.stderr?.on('data', (data) => {
						const str = data.toString();
						totalLog += str;
						this.outputChannel.append(str);
					});

					proc.on('close', (exitCode) => {
						this.currentProcess = null;
						resolve(exitCode ?? 0);
					});

					proc.on('error', (err) => {
						this.outputChannel.appendLine(`\n[LaTeX Studio Error] Failed to launch ${command}: ${err.message}`);
						this.currentProcess = null;
						resolve(-1);
					});
				} catch (err) {
					this.outputChannel.appendLine(`\n[LaTeX Studio Exception] ${(err as Error).message}`);
					resolve(-1);
				}
			});

			if (code !== 0) {
				success = false;
				this.outputChannel.appendLine(`\n[LaTeX Studio] Step ${i + 1} exited with error code ${code}`);
				break;
			}
		}

		this.isBuilding = false;
		this.onBuildStatusChangedEmitter.fire(false);

		const result: BuildResult = {
			success,
			pdfPath: success ? pdfPath : undefined,
			logContent: totalLog,
			errorCount: (totalLog.match(/^!\s+.+/gm) || []).length,
			warningCount: (totalLog.match(/LaTeX Warning:.+/gi) || []).length
		};

		if (success) {
			this.outputChannel.appendLine(`\n[LaTeX Studio] Build succeeded! Generated: ${pdfPath}`);
			vscode.window.showInformationMessage(`LaTeX Studio: Build succeeded!`);
		} else {
			this.outputChannel.appendLine(`\n[LaTeX Studio] Build failed with errors. See log above for details.`);
			vscode.window.showErrorMessage(`LaTeX Studio: Build failed. Check LaTeX Studio Build output.`);
		}

		this.onBuildFinishedEmitter.fire(result);
		return result;
	}

	public cancel(): void {
		if (this.currentProcess) {
			this.currentProcess.kill();
			this.currentProcess = null;
			this.isBuilding = false;
			this.onBuildStatusChangedEmitter.fire(false);
			this.outputChannel.appendLine(`\n[LaTeX Studio] Build was cancelled by user.`);
		}
	}

	public dispose(): void {
		this.cancel();
		this.outputChannel.dispose();
		this.onBuildFinishedEmitter.dispose();
		this.onBuildStatusChangedEmitter.dispose();
	}
}
