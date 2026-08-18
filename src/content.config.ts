import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

export const GUIDE_CLUSTERS = [
  'parcheggio',
  'chiaia',
  'arrivo',
  'gruppi',
  'wellness',
  'napoli',
  'business',
  'diretta',
] as const;

/**
 * Q&A guide articles. One file per question, split by language in
 * src/content/guida/it/ and src/content/guida/en/. The `slug` frontmatter is
 * the public URL segment (/guida/[slug] and /en/guide/[slug]); slugs differ
 * across languages, so `translationSlug` is what pairs an article with its
 * counterpart for hreflang. No pair, no hreflang.
 */
const guida = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: './src/content/guida',
    // Ids are `<lang>/<slug>` so the same slug can exist in both languages
    // without colliding (the default loader would use the bare `slug`).
    generateId: ({ entry, data }) => {
      const dir = entry.split('/')[0];
      const slug =
        typeof data.slug === 'string' && data.slug.length > 0
          ? data.slug
          : entry.replace(/\.mdx$/, '').split('/').pop()!;
      return `${dir}/${slug}`;
    },
  }),
  schema: z.object({
    /** The exact question. Becomes the H1, the Article headline and the FAQ Question. */
    title: z.string(),
    slug: z.string(),
    lang: z.enum(['it', 'en']),
    cluster: z.enum(GUIDE_CLUSTERS),
    /** Direct answer shown in the highlighted block and as the FAQ acceptedAnswer. */
    answer: z
      .string()
      .refine(v => v.trim().split(/\s+/).length <= 45, 'answer must be 45 words or fewer'),
    description: z.string().max(155),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Slugs of the three related articles, same language. Missing ones render nothing. */
    related: z.array(z.string()).length(3),
    propertyLink: z.object({ href: z.string(), label: z.string() }).optional(),
    /** `@id`s of Place/LodgingBusiness nodes in the site entity graph. */
    mentions: z.array(z.string()).optional(),
    /** Slug of the same article in the other language, for the hreflang pair. */
    translationSlug: z.string().optional(),
  }),
});

export const collections = { guida };
