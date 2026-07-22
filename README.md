# luckylwk

A personal blog built with [Astro](https://astro.build), deployed to GitHub
Pages. Posts are authored in Markdown/MDX and support LaTeX math, syntax
highlighting, GFM tables, and interactive React components.

Live site: <https://luckylwk.github.io>

## Tech stack

- **Astro** with Content Collections (typed frontmatter via Zod)
- **remark-math + rehype-katex** for LaTeX math (KaTeX CSS bundled locally)
- **Shiki** (`github-dark`) for code syntax highlighting
- **React + MDX** for interactive islands (e.g. charts via `recharts`)
- **GitHub Actions** for build & deploy

## Local development

All commands run from the project root:

| Command            | Action                                   |
| :----------------- | :--------------------------------------- |
| `pnpm install`     | Install dependencies                     |
| `pnpm run dev`     | Start the dev server at `localhost:4321` |
| `pnpm run build`   | Build the production site to `./dist/`   |
| `pnpm run preview` | Preview the production build locally     |

## Adding a new post

1. Create a file in `src/content/blog/` — use `.md` for plain posts or `.mdx`
   when you need to embed React components.
2. Add frontmatter matching the schema (see below).
3. Write your content. Drafts (`draft: true`) are hidden from listings and the
   production build; publish by setting it to `false` (or removing it).

### Frontmatter schema

Defined and type-checked in `src/content.config.ts`:

| Field         | Type     | Required | Notes                                             |
| :------------ | :------- | :------- | :------------------------------------------------ |
| `title`       | string   | yes      | Post title.                                       |
| `description` | string   | yes      | Used for SEO / Open Graph.                        |
| `pubDate`     | date     | yes      | e.g. `'Jul 08 2026'`.                             |
| `updatedDate` | date     | no       | Shown as "Last updated on".                       |
| `heroImage`   | image    | no       | Path relative to the post, e.g. `../../assets/…`. |
| `tags`        | string[] | no       | Defaults to `[]`; drives the `/tags` pages.       |
| `draft`       | boolean  | no       | Defaults to `false`; `true` hides the post.       |

Example:

```yaml
---
title: 'My post'
description: 'A one-line summary.'
pubDate: 'Jul 08 2026'
tags: ['guide', 'astro']
draft: false
---
```

### Tags

Every string listed in a post's `tags` array automatically appears on:

- `/tags` — an index of all tags with post counts, and
- `/tags/<tag>` — a page listing every post with that tag.

No extra configuration is needed; add a tag to a post and the pages regenerate
on the next build.

### Math, code, and interactive components

- **Math** — inline `$E = mc^2$` and display `$$ … $$` blocks render via KaTeX.
- **Code** — fenced code blocks are highlighted with the `github-dark` theme.
- **React islands** — in an `.mdx` post, import a component and render it with a
  client directive:

  ```mdx
  import Counter from '../../components/Counter.jsx';

  <Counter client:visible start={3} />
  ```

  See `src/content/blog/math-and-code.mdx` and `data-visualization.mdx` for
  working examples.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
with `withastro/action` and publishes it with `actions/deploy-pages`. Ensure
**Settings → Pages → Source** is set to **GitHub Actions** (one-time setup).

The `site` and `base` values live in `astro.config.mjs`. This site deploys at
the domain root (`base: '/'`); a project repo would use `base: '/<repo-name>'`.
