/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export interface ExtractedMath {
	type: 'inline' | 'display' | 'environment';
	rawContent: string;
	mathCode: string;
	range: vscode.Range;
	environmentName?: string;
}

export class MathExtractor {
	private static readonly MATH_ENVIRONMENTS = [
		'equation',
		'equation*',
		'align',
		'align*',
		'gather',
		'gather*',
		'multline',
		'multline*',
		'flalign',
		'flalign*',
		'alignat',
		'alignat*',
		'matrix',
		'pmatrix',
		'bmatrix',
		'vmatrix',
		'Vmatrix'
	];

	public static extractAt(document: vscode.TextDocument, position: vscode.Position): ExtractedMath | null {
		// 1. Try inline math ($...$) on the same line
		const inlineMath = this.extractInlineMath(document, position);
		if (inlineMath) {
			return inlineMath;
		}

		// 2. Try display math (\[...\])
		const displayMath = this.extractDisplayMath(document, position);
		if (displayMath) {
			return displayMath;
		}

		// 3. Try math environments (\begin{equation}...\end{equation})
		const envMath = this.extractEnvironmentMath(document, position);
		if (envMath) {
			return envMath;
		}

		return null;
	}

	private static extractInlineMath(document: vscode.TextDocument, position: vscode.Position): ExtractedMath | null {
		const lineText = document.lineAt(position.line).text;
		const charIdx = position.character;

		// Find non-escaped dollar signs
		const dollarIndices: number[] = [];
		for (let i = 0; i < lineText.length; i++) {
			if (lineText[i] === '$' && (i === 0 || lineText[i - 1] !== '\\')) {
				dollarIndices.push(i);
			}
		}

		// Check pairs of $...$
		for (let i = 0; i < dollarIndices.length - 1; i += 2) {
			const start = dollarIndices[i];
			const end = dollarIndices[i + 1];

			if (charIdx >= start && charIdx <= end + 1) {
				const mathCode = lineText.substring(start + 1, end).trim();
				if (mathCode.length > 0) {
					return {
						type: 'inline',
						rawContent: lineText.substring(start, end + 1),
						mathCode,
						range: new vscode.Range(position.line, start, position.line, end + 1)
					};
				}
			}
		}

		return null;
	}

	private static extractDisplayMath(document: vscode.TextDocument, position: vscode.Position): ExtractedMath | null {
		const fullText = document.getText();
		const offset = document.offsetAt(position);

		const startRegex = /\\\[/g;
		let lastStart = -1;
		let match: RegExpExecArray | null;

		while ((match = startRegex.exec(fullText)) !== null) {
			if (match.index <= offset) {
				lastStart = match.index;
			} else {
				break;
			}
		}

		if (lastStart !== -1) {
			const endIdx = fullText.indexOf('\\]', lastStart);
			if (endIdx !== -1 && offset <= endIdx + 2) {
				const rawContent = fullText.substring(lastStart, endIdx + 2);
				const mathCode = fullText.substring(lastStart + 2, endIdx).trim();
				const startPos = document.positionAt(lastStart);
				const endPos = document.positionAt(endIdx + 2);

				return {
					type: 'display',
					rawContent,
					mathCode,
					range: new vscode.Range(startPos, endPos)
				};
			}
		}

		return null;
	}

	private static extractEnvironmentMath(document: vscode.TextDocument, position: vscode.Position): ExtractedMath | null {
		const fullText = document.getText();
		const offset = document.offsetAt(position);

		for (const env of this.MATH_ENVIRONMENTS) {
			const beginPattern = `\\begin{${env}}`;
			const endPattern = `\\end{${env}}`;

			let searchStart = 0;
			while (true) {
				const beginIdx = fullText.indexOf(beginPattern, searchStart);
				if (beginIdx === -1 || beginIdx > offset) {
					break;
				}

				const endIdx = fullText.indexOf(endPattern, beginIdx);
				if (endIdx !== -1) {
					const closeIdx = endIdx + endPattern.length;
					if (offset >= beginIdx && offset <= closeIdx) {
						const rawContent = fullText.substring(beginIdx, closeIdx);
						const innerMath = fullText.substring(beginIdx + beginPattern.length, endIdx).trim();
						const startPos = document.positionAt(beginIdx);
						const endPos = document.positionAt(closeIdx);

						return {
							type: 'environment',
							rawContent,
							mathCode: innerMath,
							environmentName: env,
							range: new vscode.Range(startPos, endPos)
						};
					}
				}

				searchStart = beginIdx + beginPattern.length;
			}
		}

		return null;
	}
}
