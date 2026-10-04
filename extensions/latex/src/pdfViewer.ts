/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SyncTeXManager } from './synctex.ts';

export class PDFViewerManager {
	private static instance: PDFViewerManager;
	private panelMap = new Map<string, vscode.WebviewPanel>();
	private currentPdfPath: string | null = null;

	public static getInstance(): PDFViewerManager {
		if (!this.instance) {
			this.instance = new PDFViewerManager();
		}
		return this.instance;
	}

	public get activePdf(): string | null {
		return this.currentPdfPath;
	}

	public async open(pdfPath: string, viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside): Promise<vscode.WebviewPanel> {
		this.currentPdfPath = pdfPath;
		const normalizedPath = path.normalize(pdfPath);

		let existingPanel = this.panelMap.get(normalizedPath);
		if (existingPanel) {
			existingPanel.reveal(viewColumn, true);
			return existingPanel;
		}

		const title = `[Preview] ${path.basename(pdfPath)}`;
		const panel = vscode.window.createWebviewPanel(
			'latexStudio.pdfViewer',
			title,
			{ viewColumn, preserveFocus: true },
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.file(path.dirname(pdfPath))
				]
			}
		);

		this.panelMap.set(normalizedPath, panel);

		panel.onDidDispose(() => {
			this.panelMap.delete(normalizedPath);
			if (this.currentPdfPath === normalizedPath) {
				this.currentPdfPath = null;
			}
		});

		panel.webview.onDidReceiveMessage(async (msg) => {
			if (msg.type === 'inverseSync') {
				const result = await SyncTeXManager.inverseSync(pdfPath, msg.page || 1, msg.x || 0, msg.y || 0);
				if (result) {
					await SyncTeXManager.jumpToSource(result);
				}
			} else if (msg.type === 'info') {
				vscode.window.showInformationMessage(msg.text);
			}
		});

		panel.webview.html = this.getHtmlContent(panel.webview, pdfPath);
		return panel;
	}

	public refresh(pdfPath: string): void {
		const normalized = path.normalize(pdfPath);
		const panel = this.panelMap.get(normalized);
		if (panel) {
			panel.webview.postMessage({ type: 'reload' });
		}
	}

	public scrollTo(pdfPath: string, page: number): void {
		const normalized = path.normalize(pdfPath);
		const panel = this.panelMap.get(normalized);
		if (panel) {
			panel.webview.postMessage({ type: 'scrollToPage', page });
		}
	}

	private getHtmlContent(webview: vscode.Webview, pdfPath: string): string {
		const pdfUri = webview.asWebviewUri(vscode.Uri.file(pdfPath));
		const fileName = path.basename(pdfPath);

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${fileName}</title>
	<style>
		* { box-sizing: border-box; margin: 0; padding: 0; }
		body {
			background-color: var(--vscode-editor-background, #1e1e1e);
			color: var(--vscode-editor-foreground, #cccccc);
			font-family: var(--vscode-font-family, sans-serif);
			display: flex;
			flex-direction: column;
			height: 100vh;
			overflow: hidden;
		}
		.toolbar {
			background: var(--vscode-editorGroupHeader-tabsBackground, #252526);
			border-bottom: 1px solid var(--vscode-widget-border, #333333);
			padding: 6px 12px;
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 12px;
			user-select: none;
		}
		.toolbar button {
			background: var(--vscode-button-secondaryBackground, #3a3d41);
			color: var(--vscode-button-secondaryForeground, #ffffff);
			border: 1px solid var(--vscode-button-border, transparent);
			border-radius: 3px;
			padding: 3px 8px;
			cursor: pointer;
			font-size: 11px;
			display: inline-flex;
			align-items: center;
			gap: 4px;
		}
		.toolbar button:hover {
			background: var(--vscode-button-secondaryHoverBackground, #45494e);
		}
		.toolbar .file-label {
			font-weight: 600;
			margin-right: auto;
			color: var(--vscode-foreground, #fff);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.toolbar .sync-badge {
			background: var(--vscode-badge-background, #007acc);
			color: var(--vscode-badge-foreground, #fff);
			padding: 2px 6px;
			border-radius: 10px;
			font-size: 10px;
		}
		.viewer-container {
			flex: 1;
			width: 100%;
			height: calc(100vh - 38px);
			background: #525659;
			position: relative;
		}
		iframe {
			width: 100%;
			height: 100%;
			border: none;
			background: #fff;
		}
		.hint {
			position: absolute;
			bottom: 8px;
			right: 12px;
			background: rgba(0, 0, 0, 0.7);
			color: #eee;
			font-size: 11px;
			padding: 4px 8px;
			border-radius: 4px;
			pointer-events: none;
		}
	</style>
</head>
<body>
	<div class="toolbar">
		<span class="file-label">📄 ${fileName}</span>
		<span class="sync-badge">SyncTeX 联动中</span>
		<button id="btnZoomIn" title="放大">🔍 +</button>
		<button id="btnZoomOut" title="缩小">🔍 -</button>
		<button id="btnReload" title="重新载入">🔄 刷新</button>
	</div>
	<div class="viewer-container">
		<iframe id="pdfFrame" src="${pdfUri}"></iframe>
		<div class="hint">提示：在编辑区可使用 Ctrl+Alt+J 快捷定位到 PDF</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		const iframe = document.getElementById('pdfFrame');
		const baseSrc = "${pdfUri}";

		document.getElementById('btnReload').addEventListener('click', () => {
			reloadPdf();
		});

		function reloadPdf() {
			// Append cache-busting timestamp
			const url = new URL(baseSrc, window.location.href);
			url.searchParams.set('t', Date.now());
			iframe.src = url.toString();
		}

		window.addEventListener('message', (event) => {
			const message = event.data;
			if (message.type === 'reload') {
				reloadPdf();
			} else if (message.type === 'scrollToPage') {
				const url = new URL(baseSrc, window.location.href);
				url.hash = 'page=' + message.page;
				iframe.src = url.toString();
			}
		});
	</script>
</body>
</html>`;
	}

	public dispose(): void {
		for (const panel of this.panelMap.values()) {
			panel.dispose();
		}
		this.panelMap.clear();
	}
}
