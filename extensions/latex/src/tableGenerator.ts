/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface TableGeneratorOptions {
	caption?: string;
	label?: string;
	alignment?: string[]; // e.g. ['l', 'c', 'r']
	useBooktabs?: boolean;
	centering?: boolean;
}

/**
 * Converts Markdown tables or Comma/Tab Separated Values (CSV/TSV)
 * into high-quality academic LaTeX `booktabs` tables.
 */
export class TableGenerator {
	public static parseRawInput(raw: string): string[][] {
		const lines = raw.trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
		if (lines.length === 0) {
			return [];
		}

		// Detect if Markdown table (starts or contains '|')
		if (lines.some((l) => l.includes('|'))) {
			return this.parseMarkdownTable(lines);
		}

		// Detect if Tab-separated
		if (lines.some((l) => l.includes('\t'))) {
			return lines.map((l) => l.split('\t').map((c) => c.trim()));
		}

		// Fallback to CSV (comma separated)
		return this.parseCSV(lines);
	}

	private static parseMarkdownTable(lines: string[]): string[][] {
		const rows: string[][] = [];
		for (const line of lines) {
			// Skip separator rows like |---|:---:|---|
			if (/^\|?(\s*:?-+:?\s*\|?)+$/.test(line)) {
				continue;
			}
			const cells = line
				.replace(/^\|/, '')
				.replace(/\|$/, '')
				.split('|')
				.map((c) => c.trim());
			if (cells.length > 0) {
				rows.push(cells);
			}
		}
		return rows;
	}

	private static parseCSV(lines: string[]): string[][] {
		const rows: string[][] = [];
		for (const line of lines) {
			// Simple CSV parser handling quotes
			const cells: string[] = [];
			let inQuotes = false;
			let current = '';

			for (let i = 0; i < line.length; i++) {
				const char = line[i];
				if (char === '"' || char === "'") {
					inQuotes = !inQuotes;
				} else if (char === ',' && !inQuotes) {
					cells.push(current.trim());
					current = '';
				} else {
					current += char;
				}
			}
			cells.push(current.trim());
			rows.push(cells);
		}
		return rows;
	}

	public static generateLaTeX(data: string[][], options: TableGeneratorOptions = {}): string {
		if (data.length === 0) {
			return '';
		}

		const numCols = Math.max(...data.map((r) => r.length));
		if (numCols === 0) {
			return '';
		}

		const defaultAlign = Array(numCols).fill('l').join('');
		const alignStr = options.alignment ? options.alignment.join('') : defaultAlign;
		const caption = options.caption || 'Table caption here';
		const label = options.label || 'tab:my_table';
		const useBooktabs = options.useBooktabs !== false;
		const centering = options.centering !== false;

		const lines: string[] = [];
		lines.push('\\begin{table}[htbp]');
		if (centering) {
			lines.push('\t\\centering');
		}
		lines.push(`\t\\caption{${caption}}`);
		lines.push(`\t\\label{${label}}`);
		lines.push(`\t\\begin{tabular}{${alignStr}}`);

		if (useBooktabs) {
			lines.push('\t\t\\toprule');
		} else {
			lines.push('\t\t\\hline');
		}

		for (let i = 0; i < data.length; i++) {
			const row = data[i];
			// Pad row if fewer cells
			const paddedRow = [...row];
			while (paddedRow.length < numCols) {
				paddedRow.push('');
			}

			// Format row
			const rowContent = paddedRow.map((cell) => TableGenerator.escapeLatexCell(cell)).join(' & ');
			lines.push(`\t\t${rowContent} \\\\`);

			if (i === 0) {
				// Header separator
				if (useBooktabs) {
					lines.push('\t\t\\midrule');
				} else {
					lines.push('\t\t\\hline');
				}
			}
		}

		if (useBooktabs) {
			lines.push('\t\t\\bottomrule');
		} else {
			lines.push('\t\t\\hline');
		}

		lines.push('\t\\end{tabular}');
		lines.push('\\end{table}');

		return lines.join('\n');
	}

	private static escapeLatexCell(cell: string): string {
		// Escape common special chars if not already in LaTeX math or macro
		if (cell.startsWith('$') && cell.endsWith('$')) {
			return cell;
		}
		return cell
			.replace(/%/g, '\\%')
			.replace(/&/g, '\\&')
			.replace(/#/g, '\\#')
			.replace(/_/g, '\\_');
	}
}
