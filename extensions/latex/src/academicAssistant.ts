/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export interface RewriteOption {
	id: string;
	title: string;
	description: string;
	transform: (text: string) => string;
}

/**
 * Academic Tone & Grammar Polish Engine
 * Provides rule-based academic transformations and prompt generation for LLM/AI workflows.
 */
export class AcademicAssistant {
	private static readonly CASUAL_TO_ACADEMIC_MAP: [RegExp, string][] = [
		[/\ba lot of\b/gi, 'a substantial number of'],
		[/\blots of\b/gi, 'numerous'],
		[/\bkind of\b/gi, 'somewhat'],
		[/\bsort of\b/gi, 'to some extent'],
		[/\bget rid of\b/gi, 'eliminate'],
		[/\blook into\b/gi, 'investigate'],
		[/\bfind out\b/gi, 'ascertain'],
		[/\bset up\b/gi, 'establish'],
		[/\bcome up with\b/gi, 'devise'],
		[/\bput forward\b/gi, 'propose'],
		[/\bshow up\b/gi, 'manifest'],
		[/\bgo up\b/gi, 'increase'],
		[/\bgo down\b/gi, 'decrease'],
		[/\bbig problem\b/gi, 'significant challenge'],
		[/\bgood result\b/gi, 'favorable outcome'],
		[/\bbad result\b/gi, 'unfavorable outcome'],
		[/\breally important\b/gi, 'crucial'],
		[/\bvery important\b/gi, 'paramount'],
		[/\bvery clear\b/gi, 'evident'],
		[/\bvery hard\b/gi, 'challenging'],
		[/\bvery easy\b/gi, 'straightforward'],
		[/\bcan't\b/gi, 'cannot'],
		[/\bdon't\b/gi, 'do not'],
		[/\bdoesn't\b/gi, 'does not'],
		[/\bwon't\b/gi, 'will not'],
		[/\bit's\b/gi, 'it is'],
		[/\bin a nutshell\b/gi, 'in summary'],
		[/\bto sum up\b/gi, 'in conclusion'],
		[/\balso,\b/gi, 'Furthermore,'],
		[/\bbut,\b/gi, 'However,'],
		[/\bso,\b/gi, 'Therefore,'],
		[/\blike this:\b/gi, 'as follows:'],
	];

	public static getRewriteOptions(): RewriteOption[] {
		return [
			{
				id: 'formal-academic',
				title: 'Academic Tone & Style Polish',
				description: 'Replace colloquial expressions, informal contractions, and conversational phrasing with scholarly terms',
				transform: (text: string) => AcademicAssistant.formalizeText(text)
			},
			{
				id: 'passive-voice',
				title: 'Objective Research Stance (Passive / Impersonal)',
				description: 'Convert first-person pronouns ("we found", "I propose") into objective scientific prose ("it was observed", "is proposed")',
				transform: (text: string) => AcademicAssistant.impersonalizeText(text)
			},
			{
				id: 'concise',
				title: 'Academic Conciseness & Precision',
				description: 'Eliminate redundant fillers and wordy phrases (e.g., "due to the fact that" -> "because")',
				transform: (text: string) => AcademicAssistant.makeConcise(text)
			},
			{
				id: 'math-notation-polish',
				title: 'LaTeX Math Punctuation Normalization',
				description: 'Fix standard mathematical spacing, trailing punctuation, and equation punctuation conventions',
				transform: (text: string) => AcademicAssistant.normalizeMathPunctuation(text)
			}
		];
	}

	public static formalizeText(text: string): string {
		let result = text;
		for (const [pattern, replacement] of this.CASUAL_TO_ACADEMIC_MAP) {
			result = result.replace(pattern, (match) => {
				// Preserve capitalization if first character was uppercase
				if (match[0] === match[0].toUpperCase()) {
					return replacement.charAt(0).toUpperCase() + replacement.slice(1);
				}
				return replacement;
			});
		}
		return result;
	}

	public static impersonalizeText(text: string): string {
		let result = text;
		const replacements: [RegExp, string][] = [
			[/\bWe show that\b/gi, 'The results demonstrate that'],
			[/\bWe observe that\b/gi, 'It is observed that'],
			[/\bWe found that\b/gi, 'It was found that'],
			[/\bWe propose\b/gi, 'This paper proposes'],
			[/\bWe present\b/gi, 'This study presents'],
			[/\bWe argue that\b/gi, 'It is contended that'],
			[/\bIn our opinion\b/gi, 'From an analytical perspective'],
			[/\bIn this paper, we\b/gi, 'In this work, the authors'],
			[/\bOur method\b/gi, 'The proposed method'],
			[/\bOur approach\b/gi, 'The proposed approach'],
			[/\bOur framework\b/gi, 'The presented framework']
		];

		for (const [regex, rep] of replacements) {
			result = result.replace(regex, rep);
		}
		return result;
	}

	public static makeConcise(text: string): string {
		let result = text;
		const redundancies: [RegExp, string][] = [
			[/\bdue to the fact that\b/gi, 'because'],
			[/\bin order to\b/gi, 'to'],
			[/\bat the present time\b/gi, 'currently'],
			[/\bat this point in time\b/gi, 'currently'],
			[/\bin spite of the fact that\b/gi, 'although'],
			[/\ba majority of\b/gi, 'most'],
			[/\bhas the potential to\b/gi, 'can'],
			[/\bis capable of\b/gi, 'can'],
			[/\btake into consideration\b/gi, 'consider'],
			[/\bconduct an investigation into\b/gi, 'investigate'],
			[/\bhas been shown to be\b/gi, 'is'],
			[/\bit is interesting to note that\b/gi, 'notably,']
		];

		for (const [regex, rep] of redundancies) {
			result = result.replace(regex, rep);
		}
		return result;
	}

	public static normalizeMathPunctuation(text: string): string {
		// Ensure non-breaking tilde before \cite or \ref (e.g., "in~\cite{...}" or "in~\ref{...}")
		let result = text.replace(/([A-Za-z0-9])\s+\\cite\{/g, '$1~\\cite{');
		result = result.replace(/([A-Za-z0-9])\s+\\ref\{/g, '$1~\\ref{');
		result = result.replace(/([A-Za-z0-9])\s+\\eqref\{/g, '$1~\\eqref{');

		// Standardize ellipsis to \ldots or \cdots
		result = result.replace(/\.\.\./g, '\\dots');
		return result;
	}
}
