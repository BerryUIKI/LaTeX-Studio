/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ActionsProvider } from './actionsProvider.ts';
import { LaTeXCleaner } from './cleaner.ts';
import { LaTeXCompiler } from './compiler.ts';
import { TeXDetector } from './detector.ts';
import { LaTeXLogParser } from './logParser.ts';
import { OutlineProvider } from './outlineProvider.ts';
import { PDFViewerManager } from './pdfViewer.ts';
import { DEFAULT_RECIPES } from './recipes.ts';
import { SymbolsProvider } from './symbolsProvider.ts';
import { SyncTeXManager } from './synctex.ts';
import { TemplateWizard } from './templates.ts';

export function activate(context: vscode.ExtensionContext) {
	const compiler = new LaTeXCompiler();
	const logParser = new LaTeXLogParser();
	const pdfViewer = PDFViewerManager.getInstance();

	// Tree View Providers
	const actionsProvider = new ActionsProvider();
	const outlineProvider = new OutlineProvider();
	const symbolsProvider = new SymbolsProvider();

	vscode.window.registerTreeDataProvider('latex-studio.actions', actionsProvider);
	vscode.window.registerTreeDataProvider('latex-studio.outline', outlineProvider);
	vscode.window.registerTreeDataProvider('latex-studio.symbols', symbolsProvider);

	// Status Bar: Recipe Selector
	const recipeStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	recipeStatusBar.command = 'latex-studio.selectRecipe';
	recipeStatusBar.tooltip = 'Click to switch LaTeX compilation recipe';

	// Status Bar: Build Action
	const buildStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
	buildStatusBar.command = 'latex-studio.build';
	buildStatusBar.tooltip = 'Compile active LaTeX document';

	// Status Bar: PDF Preview Action
	const pdfStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
	pdfStatusBar.command = 'latex-studio.viewPdf';
	pdfStatusBar.tooltip = 'Open built-in PDF Preview';
	pdfStatusBar.text = `$(file-pdf) PDF`;

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
			pdfStatusBar.show();
		} else {
			recipeStatusBar.hide();
			buildStatusBar.hide();
			pdfStatusBar.hide();
		}
	}

	// Update on active editor change
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			updateStatusBar();
			outlineProvider.refresh();
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((doc) => {
			if (doc.languageId === 'latex' || doc.languageId === 'tex') {
				outlineProvider.refresh();
				const config = vscode.workspace.getConfiguration('latex-studio');
				const autoBuild = config.get<string>('build.autoBuild', 'onSave');
				if (autoBuild === 'onSave' && !compiler.building) {
					compiler.build(doc.uri);
				}
			}
		})
	);

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => updateStatusBar()));

	// Compiler event hooks
	compiler.onBuildStatusChanged(() => {
		updateStatusBar();
	});

	compiler.onBuildFinished(async (res) => {
		updateStatusBar();
		if (vscode.window.activeTextEditor) {
			const rootDir = path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
			logParser.parse(res.logContent, rootDir);
		}

		if (res.success && res.pdfPath) {
			pdfViewer.refresh(res.pdfPath);

			const config = vscode.workspace.getConfiguration('latex-studio');
			const autoOpen = config.get<boolean>('view.autoOpenPdf', true);
			if (autoOpen) {
				await pdfViewer.open(res.pdfPath);
			}
		}
	});

	// Helper to resolve PDF path from active editor
	function getActivePdfPath(): string | null {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return null;
		}
		const fsPath = editor.document.uri.fsPath;
		if (!fsPath.endsWith('.tex') && !fsPath.endsWith('.ltx')) {
			return null;
		}
		const dir = path.dirname(fsPath);
		const base = path.basename(fsPath, path.extname(fsPath));
		return path.join(dir, `${base}.pdf`);
	}

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

	// Register Command: View PDF
	const viewPdfCmd = vscode.commands.registerCommand('latex-studio.viewPdf', async () => {
		const pdfPath = getActivePdfPath();
		if (!pdfPath) {
			vscode.window.showWarningMessage('LaTeX Studio: Open a .tex file first to view its PDF preview.');
			return;
		}

		if (!fs.existsSync(pdfPath)) {
			const answer = await vscode.window.showInformationMessage(
				'LaTeX Studio: PDF not yet generated. Compile now?',
				'Compile'
			);
			if (answer === 'Compile') {
				await compiler.build();
			}
			return;
		}

		await pdfViewer.open(pdfPath);
	});

	// Register Command: SyncTeX Forward Search
	const synctexCmd = vscode.commands.registerCommand('latex-studio.synctex', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const texPath = editor.document.uri.fsPath;
		const pdfPath = getActivePdfPath();
		if (!pdfPath || !fs.existsSync(pdfPath)) {
			vscode.window.showWarningMessage('LaTeX Studio: PDF file does not exist. Please build first.');
			return;
		}

		const line = editor.selection.active.line + 1;
		const result = await SyncTeXManager.forwardSync(texPath, line, pdfPath);
		if (result) {
			await pdfViewer.open(pdfPath);
			pdfViewer.scrollTo(pdfPath, result.page);
		} else {
			vscode.window.showInformationMessage(`LaTeX Studio: SyncTeX forward search located page 1`);
			await pdfViewer.open(pdfPath);
		}
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

	// Register Command: Insert Snippet (Used by Symbol Palette)
	const insertSnippetCmd = vscode.commands.registerCommand('latex-studio.insertSnippet', (snippet: string) => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			editor.insertSnippet(new vscode.SnippetString(snippet));
		}
	});

	// Register Command: Jump to Line (Used by Outline)
	const jumpToLineCmd = vscode.commands.registerCommand('latex-studio.jumpToLine', (line: number) => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const pos = new vscode.Position(line, 0);
			editor.selection = new vscode.Selection(pos, pos);
			editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
		}
	});

	// Register Command: New Project from Template
	const newProjectCmd = vscode.commands.registerCommand('latex-studio.newProject', async () => {
		await TemplateWizard.createProject();
	});

	context.subscriptions.push(
		compiler,
		logParser,
		pdfViewer,
		recipeStatusBar,
		buildStatusBar,
		pdfStatusBar,
		buildCmd,
		cancelCmd,
		cleanCmd,
		viewPdfCmd,
		synctexCmd,
		selectRecipeCmd,
		checkEnvCmd,
		insertSnippetCmd,
		jumpToLineCmd,
		newProjectCmd
	);

	updateStatusBar();
}

export function deactivate() {}
