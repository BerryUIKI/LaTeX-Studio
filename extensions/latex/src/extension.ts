/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as vscode from 'vscode';
import { LaTeXCleaner } from './cleaner.ts';
import { LaTeXCompiler } from './compiler.ts';
import { TeXDetector } from './detector.ts';
import { LaTeXLogParser } from './logParser.ts';
import { DEFAULT_RECIPES } from './recipes.ts';

export function activate(context: vscode.ExtensionContext) {
	const compiler = new LaTeXCompiler();
	const logParser = new LaTeXLogParser();

	// Status Bar: Recipe Selector
	const recipeStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	recipeStatusBar.command = 'latex-studio.selectRecipe';
	recipeStatusBar.tooltip = 'Click to switch LaTeX compilation recipe';

	// Status Bar: Build Action
	const buildStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
	buildStatusBar.command = 'latex-studio.build';
	buildStatusBar.tooltip = 'Compile active LaTeX document';

	function updateStatusBar() {
		const editor = vscode.window.activeTextEditor;
		if (editor && (editor.document.languageId === 'latex' || editor.document.languageId === 'tex')) {
			const recipe = compiler.getActiveRecipe();
			recipeStatusBar.text = `$(gear) LaTeX: ${recipe.id}`;
			recipeStatusBar.show();

			if (compiler.building) {
				buildStatusBar.text = `$(sync~spin) Compiling...`;
				buildStatusBar.command = 'latex-studio.cancelBuild';
				buildStatusBar.tooltip = 'Click to cancel compilation';
			} else {
				buildStatusBar.text = `$(play) Build`;
				buildStatusBar.command = 'latex-studio.build';
				buildStatusBar.tooltip = 'Compile active LaTeX document';
			}
			buildStatusBar.show();
		} else {
			recipeStatusBar.hide();
			buildStatusBar.hide();
		}
	}

	// Update on active editor change
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updateStatusBar()));
	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => updateStatusBar()));

	// Compiler event hooks
	compiler.onBuildStatusChanged(() => {
		updateStatusBar();
	});

	compiler.onBuildFinished((res) => {
		updateStatusBar();
		if (vscode.window.activeTextEditor) {
			const rootDir = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
			logParser.parse(res.logContent, rootDir);
		}
	});

	// Register Command: Build
	const buildCmd = vscode.commands.registerCommand('latex-studio.build', async (uri?: vscode.Uri) => {
		await compiler.build(uri);
	});

	// Register Command: Cancel Build
	const cancelCmd = vscode.commands.registerCommand('latex-studio.cancelBuild', () => {
		compiler.cancel();
	});

	// Register Command: Clean Auxiliary Files
	const cleanCmd = vscode.commands.registerCommand('latex-studio.clean', async (uri?: vscode.Uri) => {
		await LaTeXCleaner.clean(uri);
	});

	// Register Command: Select Recipe
	const selectRecipeCmd = vscode.commands.registerCommand('latex-studio.selectRecipe', async () => {
		const items = DEFAULT_RECIPES.map((r) => ({
			label: r.label,
			description: r.description,
			id: r.id
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select LaTeX compilation recipe'
		});

		if (selected) {
			compiler.setActiveRecipe(selected.id);
			updateStatusBar();
			vscode.window.showInformationMessage(`LaTeX Studio: Switched recipe to ${selected.label}`);
		}
	});

	// Register Command: Check TeX Environment
	const checkEnvCmd = vscode.commands.registerCommand('latex-studio.checkEnvironment', async () => {
		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: 'LaTeX Studio: Detecting TeX toolchains...'
			},
			async () => {
				TeXDetector.clearCache();
				const status = await TeXDetector.detect();
				const report = Object.entries(status)
					.map(([tool, found]) => `${found ? '✅' : '❌'} ${tool}`)
					.join('  |  ');

				const hasAny = Object.values(status).some(Boolean);
				if (hasAny) {
					vscode.window.showInformationMessage(`LaTeX Studio Environment:\n${report}`);
				} else {
					vscode.window.showWarningMessage(
						`LaTeX Studio: No TeX engine found in PATH. Please install TeX Live, MiKTeX or MacTeX.`
					);
				}
			}
		);
	});

	// Auto-build on save
	const onSaveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
		if (doc.languageId === 'latex' || doc.languageId === 'tex') {
			const config = vscode.workspace.getConfiguration('latex-studio');
			const autoBuild = config.get<string>('build.autoBuild', 'onSave');
			if (autoBuild === 'onSave' && !compiler.building) {
				compiler.build(doc.uri);
			}
		}
	});

	context.subscriptions.push(
		compiler,
		logParser,
		recipeStatusBar,
		buildStatusBar,
		buildCmd,
		cancelCmd,
		cleanCmd,
		selectRecipeCmd,
		checkEnvCmd,
		onSaveListener
	);

	updateStatusBar();
}

export function deactivate() {}
