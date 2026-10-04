/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface MathTemplate {
	keywords: string[];
	latex: string;
	description: string;
}

/**
 * Natural Language Math Equation Assistant
 * Maps English / descriptive prompts to standard LaTeX mathematical notation and equations.
 */
export class MathEquationAssistant {
	public static readonly CATALOG: MathTemplate[] = [
		{
			keywords: ['euler', "euler's identity", 'exponential imaginary'],
			latex: 'e^{i\\pi} + 1 = 0',
			description: "Euler's identity relating e, i, pi, 1, and 0"
		},
		{
			keywords: ['quadratic formula', 'roots of quadratic', 'ax2+bx+c'],
			latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
			description: 'Quadratic formula for finding roots'
		},
		{
			keywords: ['gaussian', 'normal distribution', 'bell curve', 'probability density'],
			latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^{\\!2} \\right)',
			description: 'Gaussian (normal) probability density function'
		},
		{
			keywords: ['bayes', "bayes' theorem", 'conditional probability', 'posterior'],
			latex: 'P(A \\mid B) = \\frac{P(B \\mid A) \\, P(A)}{P(B)}',
			description: "Bayes' theorem for conditional probability"
		},
		{
			keywords: ['fourier transform', 'continuous fourier', 'spectrum'],
			latex: '\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} \\, dx',
			description: 'Continuous Fourier transform'
		},
		{
			keywords: ['schrodinger', "schrodinger's equation", 'quantum wave'],
			latex: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H}\\Psi(\\mathbf{r}, t)',
			description: 'Time-dependent Schrödinger equation'
		},
		{
			keywords: ['softmax', 'attention softmax', 'normalized exponential'],
			latex: '\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}',
			description: 'Softmax activation function'
		},
		{
			keywords: ['cross entropy', 'log loss', 'loss function'],
			latex: '\\mathcal{L}_{\\mathrm{CE}} = -\\sum_{i=1}^C y_i \\log(\\hat{y}_i)',
			description: 'Categorical cross-entropy loss'
		},
		{
			keywords: ['cosine similarity', 'vector similarity', 'dot product angle'],
			latex: '\\mathrm{sim}(\\mathbf{u}, \\mathbf{v}) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}',
			description: 'Cosine similarity between vectors'
		},
		{
			keywords: ['attention', 'scaled dot-product attention', 'transformer attention'],
			latex: '\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V',
			description: 'Scaled dot-product attention mechanism (Transformers)'
		},
		{
			keywords: ['taylor series', 'taylor expansion', 'power series'],
			latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n',
			description: 'Taylor series expansion around point a'
		},
		{
			keywords: ['pythagorean', 'pythagoras', 'triangle hypotenuse'],
			latex: 'a^2 + b^2 = c^2',
			description: 'Pythagorean theorem'
		},
		{
			keywords: ['mass energy', 'einstein energy', 'e=mc2'],
			latex: 'E = m c^2',
			description: "Einstein's mass-energy equivalence"
		},
		{
			keywords: ['matrix multiplication', 'matrix product'],
			latex: 'C_{ij} = \\sum_{k=1}^m A_{ik} B_{kj}',
			description: 'Matrix multiplication element formula'
		},
		{
			keywords: ['gradient descent', 'sgd update', 'weight update'],
			latex: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla \\mathcal{L}(\\mathbf{w}_t)',
			description: 'Gradient descent weight update formula'
		}
	];

	public static search(query: string): MathTemplate[] {
		const lower = query.toLowerCase().trim();
		if (!lower) {
			return this.CATALOG.slice(0, 10);
		}

		return this.CATALOG.filter((item) => {
			if (item.description.toLowerCase().includes(lower)) {
				return true;
			}
			return item.keywords.some((kw) => kw.includes(lower) || lower.includes(kw));
		});
	}
}
