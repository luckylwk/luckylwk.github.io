import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts and notes share the same frontmatter shape — notes are just
// shorter, separately-listed observations.
const postSchema = ({ image }: SchemaContext) =>
	z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.optional(image()),
		// A list of topic tags shown on each post. Defaults to none.
		tags: z.array(z.string()).default([]),
		// Drafts are excluded from listings and production builds.
		draft: z.boolean().default(false),
	});

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

const notes = defineCollection({
	// Load Markdown and MDX files in the `src/content/notes/` directory.
	loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

export const collections = { blog, notes };
