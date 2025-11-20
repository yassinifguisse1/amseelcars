import { z } from 'zod';

export const articleSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  readTime: z.string().min(1, 'Read time is required'),
  date: z.string().min(1, 'Date is required'),
  publishedAt: z.string().datetime('Invalid date format'),
  image: z.string().min(1, 'Image URL is required'),
  altText: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  featured: z.boolean(),
  indexable: z.boolean().default(true),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  author: z.object({
    name: z.string().min(1, 'Author name is required'),
    avatar: z
      .string()
      .refine(
        (val) => {
          if (!val || val === '') return true; // Empty is OK
          // Accept relative paths (starting with /) or full URLs
          return val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://');
        },
        { message: 'Avatar must be a relative path (starting with /) or a full URL (http:// or https://)' }
      )
      .optional()
      .or(z.literal('')),
    bio: z.string().optional(),
  }),
  seo: z.object({
    metaTitle: z.string().min(1, 'Meta title is required'),
    metaDescription: z.string().min(1, 'Meta description is required'),
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
    canonical: z.string().min(1, 'Canonical URL is required'),
  }),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

