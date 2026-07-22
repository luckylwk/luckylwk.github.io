// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// https://astro.build/config
export default defineConfig({
	site: 'https://luckylwk.github.io',
	base: '/',
	integrations: [mdx(), sitemap(), react()],
	markdown: {
		// Parse `$...$` / `$$...$$` and render it as KaTeX HTML.
		// Applied to both .md and .mdx (the MDX integration extends this config).
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
		shikiConfig: {
			// Light, low-contrast theme so code blocks sit calmly on warm paper.
			theme: 'min-light',
		},
	},
	fonts: [
		{
			// Calm, screen-optimized serif for prose and headings.
			provider: fontProviders.google(),
			name: 'Newsreader',
			cssVariable: '--font-serif',
			fallbacks: ['Iowan Old Style', 'Georgia', 'Cambria', 'serif'],
			weights: [400, 500, 600],
			styles: ['normal', 'italic'],
		},
		{
			// Quiet technical mono for nav, dates, tags, and code.
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-mono',
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			weights: [400, 500],
			styles: ['normal'],
		},
		{
			// Clean sans-serif for interactive visualization components.
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-viz',
			fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
			weights: [400, 500, 600, 700],
			styles: ['normal'],
		},
	],
});
