import { z } from 'zod';
import { articleLocales, type ArticleLocale } from '@/lib/validations/article';

export const mediaMetadataSchema = z.object({
  metaTitle: z.string().min(1, 'Image meta title is required'),
  altText: z.string().min(1, 'Alt text is required'),
  caption: z.string().min(1, 'Caption is required'),
  description: z.string().min(1, 'Image description is required'),
});

export const mediaMetadataDraftSchema = z.object({
  metaTitle: z.string().optional().default(''),
  altText: z.string().optional().default(''),
  caption: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

export const mediaMetadataByLocaleSchema = z.object(
  Object.fromEntries(
    articleLocales.map((locale) => [locale, mediaMetadataSchema]),
  ) as Record<ArticleLocale, typeof mediaMetadataSchema>,
);

export const mediaAssetSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  fileName: z.string().trim().optional().default(''),
  metadata: mediaMetadataByLocaleSchema,
});

export const mediaAssetDraftSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  fileName: z.string().trim().optional().default(''),
  sourceLocale: z.enum(articleLocales).optional().default('fr'),
  metadata: z.object(
    Object.fromEntries(
      articleLocales.map((locale) => [locale, mediaMetadataDraftSchema]),
    ) as Record<ArticleLocale, typeof mediaMetadataDraftSchema>,
  ),
});

export type MediaMetadata = z.infer<typeof mediaMetadataSchema>;
export type MediaMetadataDraft = z.infer<typeof mediaMetadataDraftSchema>;
export type MediaMetadataByLocale = z.infer<typeof mediaMetadataByLocaleSchema>;
export type MediaAssetFormData = z.infer<typeof mediaAssetSchema>;

export interface BlogMediaAsset {
  id: string;
  url: string;
  fileName: string;
  metadata: MediaMetadataByLocale;
  createdAt: string;
  updatedAt: string;
}

export function createEmptyMediaMetadata(): MediaMetadataByLocale {
  return Object.fromEntries(
    articleLocales.map((locale) => [
      locale,
      {
        metaTitle: '',
        altText: '',
        caption: '',
        description: '',
      },
    ]),
  ) as MediaMetadataByLocale;
}
