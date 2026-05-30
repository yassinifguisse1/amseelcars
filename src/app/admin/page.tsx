"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  articleLocales,
  articleSchema,
  type ArticleFormData,
  type ArticleLocale,
} from '@/lib/validations/article';
import {
  createEmptyMediaMetadata,
  createEmptyMediaFolder,
  type BlogMediaAsset,
  type BlogMediaFolder,
  type MediaAssetFormData,
  type MediaFolderFormData,
  type MediaMetadata,
  type MediaMetadataByLocale,
} from '@/lib/validations/media';
import { categoryToSlug } from '@/data/blog';
import {
  CalendarDays,
  CheckCircle2,
  Code2,
  Edit,
  Eye,
  FileJson,
  FileText,
  Folder,
  FolderPlus,
  Heading2,
  Heading3,
  Globe2,
  ImageIcon,
  ImagePlus,
  Languages,
  LayoutDashboard,
  Link2,
  List,
  ListPlus,
  Loader2,
  LogOut,
  Monitor,
  Plus,
  Quote,
  Search,
  Settings2,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

const categories = [
  'Guide Pratique',
  'Actualités',
  'Conseils',
  'Avis',
];

const languageOptions: Array<{
  value: ArticleLocale;
  shortLabel: string;
  label: string;
  helper: string;
}> = [
  { value: "fr", shortLabel: "FR", label: "Français", helper: "Version principale" },
  { value: "en", shortLabel: "EN", label: "English", helper: "English draft" },
  { value: "es", shortLabel: "ES", label: "Español", helper: "Spanish draft" },
  { value: "de", shortLabel: "DE", label: "Deutsch", helper: "German draft" },
  { value: "pl", shortLabel: "PL", label: "Polski", helper: "Polish draft" },
];

function createMediaFormData(): MediaAssetFormData {
  return {
    url: '',
    fileName: '',
    folderId: '',
    metadata: createEmptyMediaMetadata(),
  };
}

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return {
    error: text ? `Server returned ${response.status}: ${text.slice(0, 180)}` : response.statusText,
  };
}

function trimMediaMetadata(metadata: MediaMetadata): MediaMetadata {
  return {
    metaTitle: metadata.metaTitle.trim(),
    altText: metadata.altText.trim(),
    caption: metadata.caption.trim(),
    description: metadata.description.trim(),
  };
}

function hasCompleteMediaMetadata(metadata: MediaMetadata) {
  return (
    metadata.metaTitle.trim().length > 0 &&
    metadata.altText.trim().length > 0 &&
    metadata.caption.trim().length > 0 &&
    metadata.description.trim().length > 0
  );
}

function normalizeMediaFormData(
  data: MediaAssetFormData,
  sourceLocale: ArticleLocale,
): MediaAssetFormData & { sourceLocale: ArticleLocale } {
  const trimmedMetadata = Object.fromEntries(
    articleLocales.map((locale) => [locale, trimMediaMetadata(data.metadata[locale])]),
  ) as MediaMetadataByLocale;

  const fallbackMetadata = hasCompleteMediaMetadata(trimmedMetadata[sourceLocale])
    ? trimmedMetadata[sourceLocale]
    : articleLocales.map((locale) => trimmedMetadata[locale]).find(hasCompleteMediaMetadata);

  const metadata = fallbackMetadata
    ? (Object.fromEntries(
        articleLocales.map((locale) => [
          locale,
          hasCompleteMediaMetadata(trimmedMetadata[locale]) ? trimmedMetadata[locale] : fallbackMetadata,
        ]),
      ) as MediaMetadataByLocale)
    : trimmedMetadata;

  return {
    url: data.url.trim(),
    fileName: data.fileName.trim(),
    folderId: data.folderId.trim(),
    sourceLocale,
    metadata,
  };
}

function createArticleFolderDraft(article: {
  slug: string;
  title: string;
  translationGroup?: string;
}): MediaFolderFormData {
  const articleSlug = article.slug.trim();
  const fallbackName = article.title.trim() || articleSlug;

  return {
    name: fallbackName ? `${fallbackName} images` : '',
    slug: articleSlug ? `${articleSlug}-images` : '',
    description: articleSlug ? `Images used in article: ${articleSlug}` : '',
    articleSlug,
    translationGroup: article.translationGroup?.trim() ?? '',
  };
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

function createMediaFigureHtml(asset: BlogMediaAsset, locale: ArticleLocale): string {
  const metadata = asset.metadata[locale] ?? asset.metadata.fr;

  return `<figure class="article-media" data-media-id="${escapeHtmlAttribute(asset.id)}">
  <img src="${escapeHtmlAttribute(asset.url)}" alt="${escapeHtmlAttribute(metadata.altText)}" title="${escapeHtmlAttribute(metadata.metaTitle)}" data-caption="${escapeHtmlAttribute(metadata.caption)}" data-description="${escapeHtmlAttribute(metadata.description)}" />
  <figcaption>${escapeHtmlText(metadata.caption)}</figcaption>
</figure>`;
}

function formatSuccessMessage(
  operation: 'create' | 'update' | 'delete' | null,
  target: 'article' | 'page' | 'media asset' | 'media folder',
) {
  if (!operation) return 'Operation completed successfully!';

  const label = target.charAt(0).toUpperCase() + target.slice(1);
  const action = operation === 'create' ? 'created' : operation === 'update' ? 'updated' : 'deleted';
  const suffix = target === 'article' && operation !== 'delete' ? ' Redirecting...' : '';

  return `${label} ${action} successfully!${suffix}`;
}

export default function AdminPage() {
  const { user } = useUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'media' | 'pages'>('create');
  const [articles, setArticles] = useState<
    Array<{
      id: string;
      slug: string;
      category: string;
      locale: ArticleLocale;
      translationGroup?: string;
      published?: boolean;
      importSource?: string;
    }>
  >([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [lastSuccessOperation, setLastSuccessOperation] = useState<'create' | 'update' | 'delete' | null>(null);
  const [lastSuccessTarget, setLastSuccessTarget] = useState<'article' | 'page' | 'media asset' | 'media folder'>('article');

  // Page management states
  const [pages, setPages] = useState<Array<{ id: string; slug: string; title: string; published: boolean }>>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [pageFormData, setPageFormData] = useState({
    slug: '',
    title: '',
    content: '',
    description: '',
    image: '',
    altText: '',
    published: false,
    indexable: true,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
      canonical: '',
    },
  });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [deletePageConfirm, setDeletePageConfirm] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<BlogMediaAsset[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaFormData, setMediaFormData] = useState<MediaAssetFormData>(() => createMediaFormData());
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [deleteMediaConfirm, setDeleteMediaConfirm] = useState<string | null>(null);
  const [mediaMetadataLocale, setMediaMetadataLocale] = useState<ArticleLocale>('fr');
  const [contentEditorMode, setContentEditorMode] = useState<'write' | 'preview'>('write');
  const [mediaFolders, setMediaFolders] = useState<BlogMediaFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [foldersError, setFoldersError] = useState<string | null>(null);
  const [folderFormData, setFolderFormData] = useState<MediaFolderFormData>(() => createEmptyMediaFolder());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  // Fetch articles list (only slugs)
  const fetchArticles = async () => {
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const response = await fetch('/api/admin/articles?slugsOnly=true', {
        // Prevent caching to ensure fresh data
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data.articles || []);
      console.log('[Admin] Articles list refreshed:', data.articles?.length || 0, 'articles');
    } catch (error: unknown) {
      console.error('Error fetching articles:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to fetch articles');
    } finally {
      setArticlesLoading(false);
    }
  };

  // Fetch article for editing
  const fetchArticleForEdit = async (articleId: string) => {
    setLoadingArticle(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/admin/articles?id=${articleId}`, {
        // Prevent caching to ensure fresh data
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      const article = data.article;

      if (!article) {
        throw new Error('Article not found');
      }

      // Transform article data to form format
      const formData: ArticleFormData = {
        slug: article.slug,
        locale: article.locale ?? "fr",
        translationGroup: article.translationGroup ?? "",
        title: article.title,
        content: article.content,
        category: article.category,
        readTime: article.readTime,
        date: article.date,
        publishedAt: article.publishedAt,
        image: article.image,
        imageMetaTitle: article.imageMetaTitle || '',
        altText: article.altText,
        caption: article.caption || '',
        imageDescription: article.imageDescription || '',
        description: article.description,
        featured: article.featured,
        published: article.published ?? true,
        indexable: article.indexable ?? true,
        tags: article.tags || [],
        author: article.author,
        seo: article.seo,
      };

      setEditingArticleId(articleId);
      form.reset(formData);
      setActiveTab('create');
      setJsonMode(false);
      console.log('[Admin] Article loaded for editing:', article.slug);
    } catch (error: unknown) {
      console.error('Error fetching article:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to fetch article');
    } finally {
      setLoadingArticle(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingArticleId(null);
    form.reset();
    setSubmitError(null);
  };

  // Delete article
  const handleDeleteArticle = async (articleId: string) => {
    // Confirm deletion
    if (deleteConfirm !== articleId) {
      setDeleteConfirm(articleId);
      return;
    }

    setDeletingArticleId(articleId);
    setArticlesError(null);

    try {
      const response = await fetch(`/api/admin/articles?id=${articleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete article');
      }

      // Remove article from list
      setArticles(articles.filter(article => article.id !== articleId));
      setDeleteConfirm(null);

      // Show success message
      setLastSuccessTarget('article');
      setLastSuccessOperation('delete');
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setLastSuccessOperation(null);
      }, 3000);
    } catch (error: unknown) {
      console.error('Error deleting article:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to delete article');
    } finally {
      setDeletingArticleId(null);
    }
  };

  // Fetch pages list
  const fetchPages = async () => {
    setPagesLoading(true);
    setPagesError(null);
    try {
      const response = await fetch('/api/admin/pages?slugsOnly=true', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      const data = await response.json();
      setPages(data.pages || []);
      console.log('[Admin] Pages list refreshed:', data.pages?.length || 0, 'pages');
    } catch (error: unknown) {
      console.error('Error fetching pages:', error);
      setPagesError(error instanceof Error ? error.message : 'Failed to fetch pages');
    } finally {
      setPagesLoading(false);
    }
  };

  // Handle page form submission
  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = editingPageId
        ? `/api/admin/pages?id=${editingPageId}`
        : '/api/admin/pages';

      const method = editingPageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save page');
      }

      setSubmitSuccess(true);
      setLastSuccessTarget('page');
      setLastSuccessOperation(editingPageId ? 'update' : 'create');

      // Reset form
      setPageFormData({
        slug: '',
        title: '',
        content: '',
        description: '',
        image: '',
        altText: '',
        published: false,
        indexable: true,
        seo: {
          metaTitle: '',
          metaDescription: '',
          keywords: [],
          canonical: '',
        },
      });
      setEditingPageId(null);

      // Refresh pages list
      await fetchPages();

      console.log('[Admin] Page saved successfully:', data.page.slug);
    } catch (error: unknown) {
      console.error('Error saving page:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save page');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete page
  const handleDeletePage = async (pageId: string) => {
    // Confirm deletion
    if (deletePageConfirm !== pageId) {
      setDeletePageConfirm(pageId);
      return;
    }

    setDeletingPageId(pageId);
    setPagesError(null);

    try {
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete page');
      }

      // Remove page from list
      setPages((prevPages) => prevPages.filter((p) => p.id !== pageId));
      setDeletePageConfirm(null);
      setSubmitSuccess(true);
      setLastSuccessTarget('page');
      setLastSuccessOperation('delete');

      console.log('[Admin] Page deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting page:', error);
      setPagesError(error instanceof Error ? error.message : 'Failed to delete page');
    } finally {
      setDeletingPageId(null);
    }
  };

  // Fetch page for editing
  const fetchPageForEdit = async (pageId: string) => {
    setLoadingArticle(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page');
      }

      const data = await response.json();
      const page = data.page;

      setPageFormData({
        slug: page.slug,
        title: page.title,
        content: page.content,
        description: page.description,
        image: page.image || '',
        altText: page.altText || '',
        published: page.published,
        indexable: page.indexable ?? true,
        seo: page.seo,
      });

      setEditingPageId(pageId);
      console.log('[Admin] Page loaded for editing:', page.slug);
    } catch (error: unknown) {
      console.error('Error fetching page:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to fetch page');
    } finally {
      setLoadingArticle(false);
    }
  };

  // Cancel page editing
  const cancelPageEdit = () => {
    setEditingPageId(null);
    setPageFormData({
      slug: '',
      title: '',
      content: '',
      description: '',
      image: '',
      altText: '',
      published: false,
      indexable: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        canonical: '',
      },
    });
    setSubmitError(null);
  };

  const fetchMediaAssets = async () => {
    setMediaLoading(true);
    setMediaError(null);
    try {
      const response = await fetch('/api/admin/media', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch media assets');
      }
      const data = await readJsonResponse(response);
      setMediaAssets(data.assets || []);
    } catch (error: unknown) {
      console.error('Error fetching media assets:', error);
      setMediaError(error instanceof Error ? error.message : 'Failed to fetch media assets');
    } finally {
      setMediaLoading(false);
    }
  };

  const fetchMediaFolders = async () => {
    setFoldersLoading(true);
    setFoldersError(null);
    try {
      const response = await fetch('/api/admin/media/folders', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media folders');
      }
      setMediaFolders(data.folders || []);
    } catch (error: unknown) {
      console.error('Error fetching media folders:', error);
      setFoldersError(error instanceof Error ? error.message : 'Failed to fetch media folders');
    } finally {
      setFoldersLoading(false);
    }
  };

  const resetMediaForm = () => {
    setMediaFormData(createMediaFormData());
    setEditingMediaId(null);
    setDeleteMediaConfirm(null);
    setMediaError(null);
    setMediaMetadataLocale('fr');
  };

  const resetFolderForm = () => {
    setFolderFormData(createEmptyMediaFolder());
    setEditingFolderId(null);
    setDeleteFolderConfirm(null);
    setFoldersError(null);
  };

  const handleFolderSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = editingFolderId
        ? `/api/admin/media/folders?id=${editingFolderId}`
        : '/api/admin/media/folders';
      const method = editingFolderId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderFormData),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save media folder');
      }

      setSubmitSuccess(true);
      setLastSuccessTarget('media folder');
      setLastSuccessOperation(editingFolderId ? 'update' : 'create');
      setSelectedFolderId(data.folder?.id ?? selectedFolderId);
      resetFolderForm();
      await fetchMediaFolders();
    } catch (error: unknown) {
      console.error('Error saving media folder:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save media folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editMediaFolder = (folder: BlogMediaFolder) => {
    setEditingFolderId(folder.id);
    setFolderFormData({
      name: folder.name,
      slug: folder.slug,
      description: folder.description,
      articleSlug: folder.articleSlug,
      translationGroup: folder.translationGroup,
    });
    setActiveTab('media');
    setFoldersError(null);
  };

  const handleDeleteMediaFolder = async (folderId: string) => {
    if (deleteFolderConfirm !== folderId) {
      setDeleteFolderConfirm(folderId);
      return;
    }

    setDeletingFolderId(folderId);
    setFoldersError(null);
    try {
      const response = await fetch(`/api/admin/media/folders?id=${folderId}`, {
        method: 'DELETE',
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete media folder');
      }

      setMediaFolders((current) => current.filter((folder) => folder.id !== folderId));
      setMediaAssets((current) =>
        current.map((asset) =>
          asset.folderId === folderId ? { ...asset, folderId: '', folderName: '' } : asset,
        ),
      );
      setDeleteFolderConfirm(null);
      if (editingFolderId === folderId) {
        resetFolderForm();
      }
      if (selectedFolderId === folderId) {
        setSelectedFolderId('all');
      }
      setSubmitSuccess(true);
      setLastSuccessTarget('media folder');
      setLastSuccessOperation('delete');
    } catch (error: unknown) {
      console.error('Error deleting media folder:', error);
      setFoldersError(error instanceof Error ? error.message : 'Failed to delete media folder');
    } finally {
      setDeletingFolderId(null);
    }
  };

  const updateMediaMetadata = (
    locale: ArticleLocale,
    field: keyof MediaMetadataByLocale[ArticleLocale],
    value: string,
  ) => {
    setMediaFormData((current) => ({
      ...current,
      metadata: {
        ...current.metadata,
        [locale]: {
          ...current.metadata[locale],
          [field]: value,
        },
      },
    }));
  };

  const handleMediaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = editingMediaId
        ? `/api/admin/media?id=${editingMediaId}`
        : '/api/admin/media';
      const method = editingMediaId ? 'PUT' : 'POST';

      const payload = normalizeMediaFormData(mediaFormData, mediaMetadataLocale);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save media asset');
      }

      setSubmitSuccess(true);
      setLastSuccessTarget('media asset');
      setLastSuccessOperation(editingMediaId ? 'update' : 'create');
      resetMediaForm();
      await fetchMediaAssets();
      await fetchMediaFolders();
    } catch (error: unknown) {
      console.error('Error saving media asset:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save media asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editMediaAsset = (asset: BlogMediaAsset) => {
    setEditingMediaId(asset.id);
    setMediaFormData({
      url: asset.url,
      fileName: asset.fileName,
      folderId: asset.folderId,
      metadata: asset.metadata,
    });
    setActiveTab('media');
    setSubmitError(null);
  };

  const handleDeleteMediaAsset = async (assetId: string) => {
    if (deleteMediaConfirm !== assetId) {
      setDeleteMediaConfirm(assetId);
      return;
    }

    setDeletingMediaId(assetId);
    setMediaError(null);
    try {
      const response = await fetch(`/api/admin/media?id=${assetId}`, {
        method: 'DELETE',
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete media asset');
      }

      setMediaAssets((current) => current.filter((asset) => asset.id !== assetId));
      setDeleteMediaConfirm(null);
      if (editingMediaId === assetId) {
        resetMediaForm();
      }
      setSubmitSuccess(true);
      setLastSuccessTarget('media asset');
      setLastSuccessOperation('delete');
      await fetchMediaFolders();
    } catch (error: unknown) {
      console.error('Error deleting media asset:', error);
      setMediaError(error instanceof Error ? error.message : 'Failed to delete media asset');
    } finally {
      setDeletingMediaId(null);
    }
  };

  // Check admin role on mount
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      try {
        // Check user's public metadata for admin role
        const role = user?.publicMetadata?.role as string | undefined;
        const admin = role === 'admin';
        setIsAdmin(admin);

        if (!admin) {
          // Redirect to unauthorized page after a brief delay
          setTimeout(() => {
            router.push('/unauthorized');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (user) {
      checkAdminRole();
    }
  }, [user, userId, router]);

  useEffect(() => {
    if ((activeTab === 'list' || activeTab === 'create') && isAdmin) {
      fetchArticles();
    }
    if ((activeTab === 'media' || activeTab === 'create') && isAdmin) {
      fetchMediaAssets();
      fetchMediaFolders();
    }
    if (activeTab === 'pages' && isAdmin) {
      fetchPages();
    }
  }, [activeTab, isAdmin]);

  const form = useForm<ArticleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(articleSchema) as any,
    defaultValues: {
      locale: 'fr',
      translationGroup: '',
      slug: '',
      title: '',
      content: '',
      category: '',
      readTime: '',
      date: '',
      publishedAt: new Date().toISOString(),
      image: '',
      imageMetaTitle: '',
      altText: '',
      caption: '',
      imageDescription: '',
      description: '',
      featured: false,
      published: true,
      indexable: true,
      tags: [],
      author: {
        name: 'Équipe AmseelCars',
        avatar: '/images/team/amseel-team.jpg',
        bio: 'Experts en location de voitures premium à Agadir',
      },
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        canonical: '',
      },
    },
  });

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const url = editingArticleId
        ? `/api/admin/articles?id=${editingArticleId}`
        : '/api/admin/articles';
      const method = editingArticleId ? 'PUT' : 'POST';

      console.log(`[Admin] ${method} request to ${url}`, {
        articleId: editingArticleId,
        slug: data.slug,
        title: data.title
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add cache-busting headers for production
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        // Prevent caching in production
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      console.log(`[Admin] Response status: ${response.status} ${response.statusText}`);

      // Try to parse JSON, but handle cases where response might not be JSON
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('[Admin] Non-JSON response:', text);
        throw new Error(`Server returned ${response.status}: ${text || response.statusText}`);
      }

      if (!response.ok) {
        const errorMessage = result.error || result.message || `Failed to ${editingArticleId ? 'update' : 'create'} article`;
        console.error('[Admin] Server error:', result);
        throw new Error(errorMessage);
      }

      console.log('[Admin] Success:', result.message || 'Article saved successfully');

      // VERIFY: For updates, log the response to confirm data
      if (editingArticleId && result.article) {
        console.log('[Admin] Update response verified:', {
          id: result.article.id,
          slug: result.article.slug,
          title: result.article.title?.substring(0, 50),
        });
      }

      const wasEditing = !!editingArticleId;
      setLastSuccessTarget('article');
      setLastSuccessOperation(wasEditing ? 'update' : 'create');
      setSubmitSuccess(true);

      // Clear form and editing state
      form.reset();
      setEditingArticleId(null);

      // IMPORTANT: Always refresh articles list after update/create
      // This ensures the UI reflects the latest data, especially in production
      await fetchArticles();

      // If we were editing, switch to list view to see the update
      if (wasEditing) {
        setActiveTab('list');
      }

      // Redirect to article list or show success message
      setTimeout(() => {
        if (activeTab === 'create') {
          setActiveTab('list');
        }
        // Force Next.js to refresh cached data in production
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      console.error('[Admin] Error submitting form:', error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitError('Network error: Unable to connect to server. Please check your connection and try again.');
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError(`Failed to ${editingArticleId ? 'update' : 'create'} article. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const parsed = JSON.parse(jsonInput);
      const validatedData = articleSchema.parse(parsed);

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create article');
      }

      setSubmitSuccess(true);
      setLastSuccessTarget('article');
      setLastSuccessOperation('create');
      setJsonInput('');

      // Refresh articles list if on list tab
      if (activeTab === 'list') {
        fetchArticles();
      }

      setTimeout(() => {
        if (activeTab === 'create') {
          setActiveTab('list');
        }
      }, 2000);
    } catch (error: unknown) {
      console.error('Error submitting JSON:', error);
      if (error instanceof Error && error.name === 'SyntaxError') {
        setSubmitError('Invalid JSON format');
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Failed to create article');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedLocale = form.watch("locale");
  const watchedTitle = form.watch("title");
  const watchedSlug = form.watch("slug");
  const watchedCategory = form.watch("category");
  const watchedImage = form.watch("image");
  const watchedImageMetaTitle = form.watch("imageMetaTitle");
  const watchedAltText = form.watch("altText");
  const watchedCaption = form.watch("caption");
  const watchedImageDescription = form.watch("imageDescription");
  const watchedDescription = form.watch("description");
  const watchedContent = form.watch("content");
  const watchedSeo = form.watch("seo");
  const selectedLanguage =
    languageOptions.find((language) => language.value === watchedLocale) ?? languageOptions[0];
  const articlePreviewPath =
    watchedSlug && watchedCategory
      ? `/${watchedLocale}/blog/${categoryToSlug(watchedCategory)}/${watchedSlug}`
      : null;
  const publishChecklist = [
    { label: "Title", complete: watchedTitle.trim().length > 0, icon: FileText },
    { label: "Slug", complete: watchedSlug.trim().length > 0, icon: Link2 },
    { label: "Category", complete: watchedCategory.trim().length > 0, icon: Tags },
    { label: "Cover", complete: watchedImage.trim().length > 0, icon: ImageIcon },
    {
      label: "Image metadata",
      complete:
        watchedImageMetaTitle.trim().length > 0 &&
        watchedAltText.trim().length > 0 &&
        watchedCaption.trim().length > 0 &&
        watchedImageDescription.trim().length > 0,
      icon: ImageIcon,
    },
    { label: "Summary", complete: watchedDescription.trim().length > 0, icon: Search },
    { label: "Article body", complete: watchedContent.trim().length > 0, icon: Edit },
    { label: "SEO", complete: !!watchedSeo?.metaTitle && !!watchedSeo?.metaDescription, icon: Globe2 },
  ];
  const completedChecklistItems = publishChecklist.filter((item) => item.complete).length;
  const languageCounts = articleLocales.map((locale) => ({
    locale,
    count: articles.filter((article) => article.locale === locale).length,
  }));
  const selectedFolder =
    selectedFolderId === 'all'
      ? null
      : mediaFolders.find((folder) => folder.id === selectedFolderId) ?? null;
  const filteredMediaAssets =
    selectedFolderId === 'all'
      ? mediaAssets
      : selectedFolderId === 'unfiled'
        ? mediaAssets.filter((asset) => !asset.folderId)
        : mediaAssets.filter((asset) => asset.folderId === selectedFolderId);
  const unfiledMediaCount = mediaAssets.filter((asset) => !asset.folderId).length;
  const selectedFolderLabel =
    selectedFolderId === 'all'
      ? 'All folders'
      : selectedFolderId === 'unfiled'
        ? 'Unfiled images'
        : selectedFolder?.name ?? 'Selected folder';
  const articleFolderDraft = createArticleFolderDraft({
    slug: watchedSlug,
    title: watchedTitle,
    translationGroup: form.watch('translationGroup'),
  });

  const appendContentSnippet = (snippet: string) => {
    const current = form.getValues('content')?.trim();
    const nextContent = current ? `${current}\n\n${snippet}` : snippet;
    form.setValue('content', nextContent, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setContentEditorMode('write');
  };

  const insertMediaIntoArticle = (asset: BlogMediaAsset) => {
    appendContentSnippet(createMediaFigureHtml(asset, watchedLocale));
  };

  const handleUseMediaAsCover = (asset: BlogMediaAsset) => {
    const metadata = asset.metadata[watchedLocale] ?? asset.metadata.fr;
    form.setValue('image', asset.url, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    form.setValue('imageMetaTitle', metadata.metaTitle, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    form.setValue('altText', metadata.altText, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    form.setValue('caption', metadata.caption, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    form.setValue('imageDescription', metadata.description, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  // Show loading state while checking role
  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This page is restricted to administrators only. If you believe this is an error, please contact the system administrator.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/')} variant="outline">
                Go Home
              </Button>
              <SignOutButton>
                <Button variant="default">Sign Out</Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] bg-[linear-gradient(90deg,rgba(17,24,39,0.045)_1px,transparent_1px),linear-gradient(rgba(17,24,39,0.045)_1px,transparent_1px)] bg-[size:28px_28px] p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Publishing Studio
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Admin Panel</h1>
                  <p className="mt-1 max-w-2xl text-sm text-white/70">
                    Localized article publishing for {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase text-white/50">Articles</p>
                  <p className="text-xl font-semibold">{articles.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase text-white/50">Languages</p>
                  <p className="text-xl font-semibold">{articleLocales.length}</p>
                </div>
                <SignOutButton>
                  <Button variant="outline" size="sm" className="border-white/20 bg-white text-slate-950 hover:bg-white/90 sm:ml-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="grid gap-2 sm:grid-cols-4">
              <Button
                variant={activeTab === 'create' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('create');
                  if (!editingArticleId) {
                    cancelEdit();
                  }
                }}
                className={activeTab === 'create' ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white'}
                size="sm"
              >
                {editingArticleId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingArticleId ? 'Edit Article' : 'Create Article'}
              </Button>
              <Button
                variant={activeTab === 'list' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('list');
                  cancelEdit();
                }}
                className={activeTab === 'list' ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white'}
                size="sm"
              >
                <List className="h-4 w-4" />
                Articles List
              </Button>
              <Button
                variant={activeTab === 'media' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('media');
                  cancelEdit();
                }}
                className={activeTab === 'media' ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white'}
                size="sm"
              >
                <ImagePlus className="h-4 w-4" />
                Media
              </Button>
              <Button
                variant={activeTab === 'pages' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('pages');
                  cancelEdit();
                  cancelPageEdit();
                }}
                className={activeTab === 'pages' ? 'bg-slate-950 text-white hover:bg-slate-800' : 'bg-white'}
                size="sm"
              >
                <FileText className="h-4 w-4" />
                Pages
              </Button>
            </div>

            {activeTab === 'create' && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!jsonMode ? 'default' : 'outline'}
                  onClick={() => setJsonMode(false)}
                  size="sm"
                  className={!jsonMode ? 'bg-[#b11226] text-white hover:bg-[#941020]' : 'bg-white'}
                >
                  <Edit className="h-4 w-4" />
                  Form Mode
                </Button>
                <Button
                  variant={jsonMode ? 'default' : 'outline'}
                  onClick={() => setJsonMode(true)}
                  size="sm"
                  className={jsonMode ? 'bg-[#b11226] text-white hover:bg-[#941020]' : 'bg-white'}
                >
                  <FileJson className="h-4 w-4" />
                  JSON Mode
                </Button>
                {editingArticleId && (
                  <Button variant="outline" onClick={cancelEdit} size="sm" className="bg-white">
                    <X className="h-4 w-4" />
                    Cancel Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <p className="text-green-700 dark:text-green-300">
                {formatSuccessMessage(lastSuccessOperation, lastSuccessTarget)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {submitError && (
          <Card className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-300">{submitError}</p>
            </CardContent>
          </Card>
        )}

        {/* Media Tab */}
        {activeTab === 'media' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-[#b11226]" />
                  {editingMediaId ? 'Edit Media Image' : 'Add Media Image'}
                </CardTitle>
                <CardDescription>
                  Upload once, then fill image metadata for every article language.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMediaSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Image *</Label>
                    <ImageUpload
                      value={mediaFormData.url}
                      onChange={(url) => setMediaFormData((current) => ({ ...current, url }))}
                      onRemove={() => setMediaFormData((current) => ({ ...current, url: '' }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="media-file-name">File Name</Label>
                    <Input
                      id="media-file-name"
                      value={mediaFormData.fileName}
                      onChange={(event) => setMediaFormData((current) => ({ ...current, fileName: event.target.value }))}
                      placeholder="agadir-airport-car-rental-cover.webp"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Folder</Label>
                    <Select
                      value={mediaFormData.folderId || 'unfiled'}
                      onValueChange={(value) =>
                        setMediaFormData((current) => ({
                          ...current,
                          folderId: value === 'unfiled' ? '' : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfiled">Unfiled images</SelectItem>
                        {mediaFolders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {languageOptions.map((language) => {
                        const metadata = mediaFormData.metadata[language.value];
                        const complete = hasCompleteMediaMetadata(metadata);

                        return (
                          <button
                            key={language.value}
                            type="button"
                            onClick={() => setMediaMetadataLocale(language.value)}
                            className={`rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                              mediaMetadataLocale === language.value
                                ? 'border-[#b11226] bg-[#b11226] text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="block font-semibold">{language.shortLabel}</span>
                            <span className={mediaMetadataLocale === language.value ? 'text-white/70' : 'text-slate-500'}>
                              {complete ? 'Ready' : 'Missing'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="media-meta-title">Meta Title *</Label>
                        <Input
                          id="media-meta-title"
                          value={mediaFormData.metadata[mediaMetadataLocale].metaTitle}
                          onChange={(event) => updateMediaMetadata(mediaMetadataLocale, 'metaTitle', event.target.value)}
                          placeholder="Localized image meta title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-alt-text">Alt Text *</Label>
                        <Input
                          id="media-alt-text"
                          value={mediaFormData.metadata[mediaMetadataLocale].altText}
                          onChange={(event) => updateMediaMetadata(mediaMetadataLocale, 'altText', event.target.value)}
                          placeholder="Localized accessibility description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-caption">Caption *</Label>
                        <Input
                          id="media-caption"
                          value={mediaFormData.metadata[mediaMetadataLocale].caption}
                          onChange={(event) => updateMediaMetadata(mediaMetadataLocale, 'caption', event.target.value)}
                          placeholder="Localized visible caption"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-description">Description *</Label>
                        <Textarea
                          id="media-description"
                          value={mediaFormData.metadata[mediaMetadataLocale].description}
                          onChange={(event) => updateMediaMetadata(mediaMetadataLocale, 'description', event.target.value)}
                          placeholder="Localized richer image description"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingMediaId && (
                      <Button type="button" variant="outline" onClick={resetMediaForm} className="flex-1">
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`${editingMediaId ? 'flex-1' : 'w-full'} bg-[#b11226] text-white hover:bg-[#941020]`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editingMediaId ? (
                        'Update Media'
                      ) : (
                        'Save Media'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-[#b11226]" />
                  {editingFolderId ? 'Edit Folder' : 'Folder Management'}
                </CardTitle>
                <CardDescription>
                  Create one folder per article and keep its images together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFolderSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="folder-name">Folder Name *</Label>
                      <Input
                        id="folder-name"
                        value={folderFormData.name}
                        onChange={(event) => setFolderFormData((current) => ({ ...current, name: event.target.value }))}
                        placeholder="article-slug images"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="folder-slug">Folder Slug</Label>
                      <Input
                        id="folder-slug"
                        value={folderFormData.slug}
                        onChange={(event) => setFolderFormData((current) => ({ ...current, slug: event.target.value }))}
                        placeholder="article-slug-images"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="folder-article-slug">Article Slug</Label>
                      <Input
                        id="folder-article-slug"
                        value={folderFormData.articleSlug}
                        onChange={(event) => setFolderFormData((current) => ({ ...current, articleSlug: event.target.value }))}
                        placeholder="article-slug"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="folder-description">Description</Label>
                    <Textarea
                      id="folder-description"
                      value={folderFormData.description}
                      onChange={(event) => setFolderFormData((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Internal note for this article image folder"
                      className="min-h-[82px]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFolderFormData(articleFolderDraft)}
                      disabled={!articleFolderDraft.name}
                    >
                      <Folder className="h-4 w-4" />
                      Use Current Article
                    </Button>
                    {editingFolderId && (
                      <Button type="button" variant="outline" onClick={resetFolderForm}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting || !folderFormData.name.trim()}
                      className="bg-slate-950 text-white hover:bg-slate-800"
                    >
                      {editingFolderId ? 'Update Folder' : 'Create Folder'}
                    </Button>
                  </div>
                </form>

                {foldersError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {foldersError}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-[#b11226]" />
                      Media Library
                    </CardTitle>
                    <CardDescription>
                      {filteredMediaAssets.length} of {mediaAssets.length} image{mediaAssets.length === 1 ? '' : 's'} shown.
                      {selectedFolder ? ` Folder: ${selectedFolder.name}` : ''}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchMediaAssets();
                      fetchMediaFolders();
                    }}
                    disabled={mediaLoading || foldersLoading}
                  >
                    {mediaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <List className="h-4 w-4" />}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-5 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId('all')}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                        selectedFolderId === 'all'
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      All ({mediaAssets.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId('unfiled')}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                        selectedFolderId === 'unfiled'
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Unfiled ({unfiledMediaCount})
                    </button>
                    {mediaFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className={`flex items-center overflow-hidden rounded-xl border ${
                          selectedFolderId === folder.id
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedFolderId(folder.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
                        >
                          <Folder className="h-4 w-4" />
                          {folder.name} ({folder.assetCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => editMediaFolder(folder)}
                          className={`border-l px-2 py-2 ${
                            selectedFolderId === folder.id ? 'border-white/15 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                          aria-label={`Edit ${folder.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMediaFolder(folder.id)}
                          disabled={deletingFolderId === folder.id}
                          className={`border-l px-2 py-2 ${
                            selectedFolderId === folder.id
                              ? 'border-white/15 hover:bg-white/10'
                              : 'border-slate-200 text-red-600 hover:bg-red-50'
                          }`}
                          aria-label={`Delete ${folder.name}`}
                        >
                          {deletingFolderId === folder.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : deleteFolderConfirm === folder.id ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  {foldersLoading && (
                    <p className="text-xs text-slate-500">Refreshing folders...</p>
                  )}
                </div>
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : mediaError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {mediaError}
                  </div>
                ) : filteredMediaAssets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">No media images in this folder.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMediaAssets.map((asset) => {
                      const metadata = asset.metadata[mediaMetadataLocale] ?? asset.metadata.fr;
                      return (
                        <div key={asset.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <div className="relative aspect-video bg-slate-100">
                            <Image
                              src={asset.url}
                              alt={metadata.altText || asset.fileName || 'Media image'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              unoptimized={asset.url.startsWith('http')}
                            />
                          </div>
                          <div className="space-y-3 p-3">
                            <div>
                              <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                                {metadata.metaTitle || asset.fileName || 'Untitled image'}
                              </p>
                              <p className="line-clamp-2 text-xs text-slate-500">{metadata.caption}</p>
                              <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                {asset.folderName || 'Unfiled'}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => editMediaAsset(asset)}>
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMediaAsset(asset.id)}
                                disabled={deletingMediaId === asset.id}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                {deletingMediaId === asset.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {deleteMediaConfirm === asset.id ? 'Confirm' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'pages' ? (
          <div className="space-y-6">
            {/* Page Form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingPageId ? 'Edit Page' : 'Add New Page'}</CardTitle>
                <CardDescription>
                  {editingPageId
                    ? 'Update the page details below.'
                    : 'Create a new page for your website.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePageSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="page-slug">Slug *</Label>
                      <Input
                        id="page-slug"
                        value={pageFormData.slug}
                        onChange={(e) => setPageFormData({ ...pageFormData, slug: e.target.value })}
                        placeholder="about-us"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        URL-friendly identifier (lowercase, hyphens only)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="page-title">Title *</Label>
                      <Input
                        id="page-title"
                        value={pageFormData.title}
                        onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                        placeholder="About Us"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="page-description">Description *</Label>
                      <Textarea
                        id="page-description"
                        value={pageFormData.description}
                        onChange={(e) => setPageFormData({ ...pageFormData, description: e.target.value })}
                        placeholder="Brief description of the page"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="page-content">Content (HTML) *</Label>
                      <Textarea
                        id="page-content"
                        value={pageFormData.content}
                        onChange={(e) => setPageFormData({ ...pageFormData, content: e.target.value })}
                        placeholder="<div>Your page content here...</div>"
                        className="h-[300px] font-mono text-sm"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="page-image">Image URL (Optional)</Label>
                      <Input
                        id="page-image"
                        value={pageFormData.image}
                        onChange={(e) => setPageFormData({ ...pageFormData, image: e.target.value })}
                        placeholder="/images/page-image.webp"
                      />
                    </div>

                    <div>
                      <Label htmlFor="page-altText">Image Alt Text (Optional)</Label>
                      <Input
                        id="page-altText"
                        value={pageFormData.altText}
                        onChange={(e) => setPageFormData({ ...pageFormData, altText: e.target.value })}
                        placeholder="Description of the image"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="page-published"
                        checked={pageFormData.published}
                        onChange={(e) => setPageFormData({ ...pageFormData, published: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="page-published">Published</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="page-indexable"
                        checked={pageFormData.indexable}
                        onChange={(e) => setPageFormData({ ...pageFormData, indexable: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="page-indexable">Indexable (SEO)</Label>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">SEO Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="page-metaTitle">Meta Title</Label>
                          <Input
                            id="page-metaTitle"
                            value={pageFormData.seo.metaTitle}
                            onChange={(e) => setPageFormData({
                              ...pageFormData,
                              seo: { ...pageFormData.seo, metaTitle: e.target.value }
                            })}
                            placeholder="SEO Title"
                          />
                        </div>

                        <div>
                          <Label htmlFor="page-metaDescription">Meta Description</Label>
                          <Textarea
                            id="page-metaDescription"
                            value={pageFormData.seo.metaDescription}
                            onChange={(e) => setPageFormData({
                              ...pageFormData,
                              seo: { ...pageFormData.seo, metaDescription: e.target.value }
                            })}
                            placeholder="SEO Description"
                          />
                        </div>

                        <div>
                          <Label htmlFor="page-canonical">Canonical URL</Label>
                          <Input
                            id="page-canonical"
                            value={pageFormData.seo.canonical}
                            onChange={(e) => setPageFormData({
                              ...pageFormData,
                              seo: { ...pageFormData.seo, canonical: e.target.value }
                            })}
                            placeholder="/page-slug"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingPageId ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingPageId ? 'Update Page' : 'Create Page'
                      )}
                    </Button>
                    {editingPageId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelPageEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Pages List */}
            <Card>
              <CardHeader>
                <CardTitle>Pages List</CardTitle>
                <CardDescription>
                  {pagesLoading
                    ? 'Loading pages...'
                    : pages.length > 0
                      ? `Total: ${pages.length} page${pages.length > 1 ? 's' : ''}`
                      : 'No pages found'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pagesError ? (
                  <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-950 p-4">
                    <p className="text-red-700 dark:text-red-300">{pagesError}</p>
                    <Button
                      onClick={fetchPages}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                ) : pages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No pages found.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pages.map((page, index) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between rounded-md border bg-background p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-8">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{page.title}</p>
                            <code className="text-xs text-muted-foreground font-mono">
                              /{page.slug}
                            </code>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${page.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                            {page.published ? 'Published' : 'Draft'}
                          </span>
                          {deletePageConfirm === page.id && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                              Click delete again to confirm
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchPageForEdit(page.id)}
                            disabled={loadingArticle || deletingPageId === page.id}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            {loadingArticle && editingPageId === page.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePage(page.id)}
                            disabled={deletingPageId === page.id || loadingArticle}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            {deletingPageId === page.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={fetchPages}
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      disabled={pagesLoading}
                    >
                      {pagesLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        'Refresh List'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>Articles List</CardTitle>
              <CardDescription>
                {articlesLoading
                  ? 'Loading articles...'
                  : articles.length > 0
                    ? `Total: ${articles.length} article${articles.length > 1 ? 's' : ''}`
                    : 'No articles found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : articlesError ? (
                <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-950 p-4">
                  <p className="text-red-700 dark:text-red-300">{articlesError}</p>
                  <Button
                    onClick={fetchArticles}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found.</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Create Your First Article
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm font-medium mb-4">
                      Total Articles: <span className="text-primary">{articles.length}</span>
                    </p>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {articles.map((article, index) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between rounded-md border bg-background p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-8">
                              #{index + 1}
                            </span>
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {article.slug}
                            </code>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                              {article.locale}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                                article.published
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                              }`}
                            >
                              {article.published ? 'Published' : 'Draft'}
                            </span>
                            {article.importSource && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                Imported
                              </span>
                            )}
                            {article.translationGroup && (
                              <span className="text-xs text-muted-foreground">
                                key: {article.translationGroup}
                              </span>
                            )}
                            {deleteConfirm === article.id && (
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Click delete again to confirm
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Navigate to article page using category from article
                                const categorySlug = categoryToSlug(article.category);
                                router.push(`/${article.locale}/blog/${categorySlug}/${article.slug}`);
                              }}
                              disabled={!article.published}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchArticleForEdit(article.id)}
                              disabled={loadingArticle || deletingArticleId === article.id}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              {loadingArticle && editingArticleId === article.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              disabled={deletingArticleId === article.id || loadingArticle}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              {deletingArticleId === article.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={fetchArticles}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={articlesLoading}
                  >
                    {articlesLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      'Refresh List'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : jsonMode ? (
          /* JSON Mode */
          <Card>
            <CardHeader>
              <CardTitle>Create Article from JSON</CardTitle>
              <CardDescription>
                Paste your article JSON here. The JSON will be validated before submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">Article JSON</Label>
                <Textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  onWheel={(e) => {
                    // Ensure mouse wheel scrolling works
                    e.currentTarget.scrollTop += e.deltaY;
                  }}
                  placeholder={`{
  "slug": "example-article",
  "locale": "fr",
  "translationGroup": "example-article-group",
  "title": "Example Title",
  "content": "<p>Article content...</p>",
  "category": "Guide Pratique",
  "readTime": "6 min",
  "date": "02 novembre 2025",
  "publishedAt": "2025-11-02T10:00:00Z",
  "image": "/images/blog/example.webp",
  "imageMetaTitle": "Example image meta title",
  "altText": "Descriptive alt text for the article image",
  "caption": "Visible image caption",
  "imageDescription": "Longer image description for media metadata",
  "description": "Article description",
  "featured": false,
  "published": true,
  "indexable": true,
  "tags": ["tag1", "tag2"],
  "author": {
    "name": "Équipe AmseelCars",
    "avatar": "/images/team/amseel-team.jpg",
    "bio": "Experts en location de voitures"
  },
  "seo": {
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "keywords": ["keyword1", "keyword2"],
    "canonical": "/blog/example-article"
  }
}`}
                  className="h-[400px] font-mono text-sm overflow-y-scroll overflow-x-scroll resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  <strong>Locales:</strong> use <code className="bg-muted px-1 py-0.5 rounded">fr</code>, <code className="bg-muted px-1 py-0.5 rounded">en</code>, <code className="bg-muted px-1 py-0.5 rounded">es</code>, <code className="bg-muted px-1 py-0.5 rounded">de</code>, or <code className="bg-muted px-1 py-0.5 rounded">pl</code>.
                  Reuse <code className="bg-muted px-1 py-0.5 rounded">translationGroup</code> across language versions.
                  <br />
                  <strong>Note:</strong> The <code className="bg-muted px-1 py-0.5 rounded">published</code> field controls public visibility.
                  The <code className="bg-muted px-1 py-0.5 rounded">indexable</code> field controls search engine indexing.
                  Set to <code className="bg-muted px-1 py-0.5 rounded">true</code> to allow indexing (default),
                  or <code className="bg-muted px-1 py-0.5 rounded">false</code> to prevent indexing.
                  If omitted, it defaults to <code className="bg-muted px-1 py-0.5 rounded">true</code>.
                </p>
              </div>
              <Button
                onClick={handleJsonSubmit}
                disabled={isSubmitting || !jsonInput.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Article'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Form Mode */
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-white p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {editingArticleId ? 'Edit Article' : 'Create New Article'}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedLanguage.label} article workspace
                  </CardDescription>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Completion</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">
                    {completedChecklistItems}/{publishChecklist.length}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="locale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Languages className="h-4 w-4 text-[#b11226]" />
                          Article Language *
                        </FormLabel>
                        <FormControl>
                          <div className="grid gap-2 sm:grid-cols-5">
                            {languageOptions.map((language) => (
                              <button
                                key={language.value}
                                type="button"
                                onClick={() => field.onChange(language.value)}
                                className={`rounded-xl border px-3 py-3 text-left transition-all ${field.value === language.value
                                    ? "border-[#b11226] bg-[#b11226] text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                aria-pressed={field.value === language.value}
                              >
                                <span className="block text-sm font-semibold uppercase">
                                  {language.shortLabel}
                                </span>
                                <span className="block text-sm font-medium">
                                  {language.label}
                                </span>
                                <span className={`mt-1 block text-xs ${field.value === language.value ? "text-white/70" : "text-slate-500"}`}>
                                  {language.helper}
                                </span>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          One article per language. Reuse the translation key to connect the versions together.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Basic Information */}
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="h-4 w-4 text-[#b11226]" />
                      Basic Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <Input placeholder="example-article" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL-friendly identifier (lowercase, hyphens only)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Article Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={form.control}
                      name="translationGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Translation Key</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="same-key-for-all-language-versions"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Use the same key for FR, EN, ES, DE, and PL versions with different slugs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="readTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Read Time *</FormLabel>
                            <FormControl>
                              <Input placeholder="6 min" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <FormControl>
                              <Input placeholder="02 novembre 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="publishedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Published At *</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Edit className="h-4 w-4 text-[#b11226]" />
                      Content
                    </h3>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <FormLabel>Article Content *</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => appendContentSnippet('<h2>Section title</h2>')}>
                                <Heading2 className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendContentSnippet('<h3>Subsection title</h3>')}>
                                <Heading3 className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendContentSnippet('<p>Write a clear paragraph here.</p>')}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendContentSnippet('<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>')}>
                                <ListPlus className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendContentSnippet('<blockquote>Important quote or takeaway.</blockquote>')}>
                                <Quote className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant={contentEditorMode === 'write' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setContentEditorMode('write')}
                                className={contentEditorMode === 'write' ? 'bg-slate-950 text-white hover:bg-slate-800' : ''}
                              >
                                <Code2 className="h-4 w-4" />
                                Write
                              </Button>
                              <Button
                                type="button"
                                variant={contentEditorMode === 'preview' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setContentEditorMode('preview')}
                                className={contentEditorMode === 'preview' ? 'bg-slate-950 text-white hover:bg-slate-800' : ''}
                              >
                                <Monitor className="h-4 w-4" />
                                Preview
                              </Button>
                            </div>
                          </div>
                          <FormControl>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                              {contentEditorMode === 'write' ? (
                                <Textarea
                                  placeholder="<p>Write article content here...</p>"
                                  className="min-h-[320px] border-0 font-mono text-sm shadow-none focus-visible:ring-0"
                                  {...field}
                                />
                              ) : (
                                <div
                                  className="prose max-w-none p-5 text-sm leading-7 prose-headings:text-slate-950 prose-p:text-slate-700 prose-img:rounded-xl"
                                  dangerouslySetInnerHTML={{
                                    __html: field.value || '<p class="text-slate-400">No content yet.</p>',
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Use HTML for article layout. Media images from the library are inserted as figures with localized metadata.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Insert Media</p>
                          <p className="text-xs text-slate-500">
                            Uses {selectedLanguage.shortLabel} metadata from {selectedFolderLabel.toLowerCase()}.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                            <SelectTrigger className="w-full sm:w-[220px]">
                              <SelectValue placeholder="Choose folder" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All folders</SelectItem>
                              <SelectItem value="unfiled">Unfiled images</SelectItem>
                              {mediaFolders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('media')}>
                            <ImagePlus className="h-4 w-4" />
                            Add Media
                          </Button>
                        </div>
                      </div>

                      {mediaLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                      ) : mediaAssets.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                          No media images yet. Add images in the Media tab.
                        </div>
                      ) : filteredMediaAssets.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                          No images in {selectedFolderLabel.toLowerCase()}.
                        </div>
                      ) : (
                        <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                          {filteredMediaAssets.map((asset) => {
                            const metadata = asset.metadata[watchedLocale] ?? asset.metadata.fr;
                            return (
                              <div key={asset.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <div className="relative aspect-video bg-slate-100">
                                  <Image
                                    src={asset.url}
                                    alt={metadata.altText || asset.fileName || 'Media image'}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                    unoptimized={asset.url.startsWith('http')}
                                  />
                                </div>
                                <div className="space-y-2 p-3">
                                  <p className="line-clamp-1 text-xs font-semibold text-slate-900">
                                    {metadata.metaTitle || asset.fileName || 'Untitled image'}
                                  </p>
                                  <p className="line-clamp-1 text-[11px] font-medium text-slate-500">
                                    {asset.folderName || 'Unfiled'}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => handleUseMediaAsCover(asset)}>
                                      Cover
                                    </Button>
                                    <Button type="button" size="sm" className="bg-[#b11226] text-white hover:bg-[#941020]" onClick={() => insertMediaIntoArticle(asset)}>
                                      Insert
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Article description"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Media */}
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <ImageIcon className="h-4 w-4 text-[#b11226]" />
                      Media
                    </h3>

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Image *</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                              onRemove={() => field.onChange("")}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload an image or enter a URL. Recommended: 1200x630px for best SEO results.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="imageMetaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Meta Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="SEO title for this image" {...field} />
                            </FormControl>
                            <FormDescription>
                              Localized title used for image title metadata.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Caption *</FormLabel>
                            <FormControl>
                              <Input placeholder="Visible caption for this image" {...field} />
                            </FormControl>
                            <FormDescription>
                              Localized caption shown or reused by image helpers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="altText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text *</FormLabel>
                          <FormControl>
                            <Input placeholder="Describe the image for accessibility and Google Images" {...field} />
                          </FormControl>
                          <FormDescription>
                            Localized accessibility text. Do not copy the article headline.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Localized media description for this image"
                              className="min-h-[90px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use this for richer image context in the selected language.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* SEO */}
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Search className="h-4 w-4 text-[#b11226]" />
                      SEO
                    </h3>

                    <FormField
                      control={form.control}
                      name="seo.metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="SEO Meta Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo.metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="SEO Meta Description"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo.keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="keyword1, keyword2, keyword3"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const keywords = e.target.value
                                  .split(',')
                                  .map(k => k.trim())
                                  .filter(k => k.length > 0);
                                field.onChange(keywords);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Separate keywords with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seo.canonical"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canonical URL *</FormLabel>
                          <FormControl>
                            <Input placeholder="/blog/example-article" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags & Featured */}
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Settings2 className="h-4 w-4 text-[#b11226]" />
                      Tags & Settings
                    </h3>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="tag1, tag2, tag3"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const tags = e.target.value
                                  .split(',')
                                  .map(t => t.trim())
                                  .filter(t => t.length > 0);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Separate tags with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Featured Article</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="!mt-0">Published</FormLabel>
                            <FormDescription>
                              Uncheck to keep this article hidden from public blog pages and sitemaps
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="indexable"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="!mt-0">Allow Search Engine Indexing</FormLabel>
                            <FormDescription>
                              Uncheck to prevent this article from appearing in search results
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-2">
                    {editingArticleId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isSubmitting}
                        className="flex-1"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting || loadingArticle}
                      className={`${editingArticleId ? 'flex-1' : 'w-full'} bg-[#b11226] text-white hover:bg-[#941020]`}
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingArticleId ? 'Updating Article...' : 'Creating Article...'}
                        </>
                      ) : (
                        editingArticleId ? 'Update Article' : 'Create Article'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-[#b11226]" />
                  Publish Status
                </CardTitle>
                <CardDescription>
                  {selectedLanguage.shortLabel} version
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-5 pt-0">
                {publishChecklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Icon className="h-4 w-4 text-slate-500" />
                        {item.label}
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${item.complete ? "bg-emerald-500" : "bg-slate-300"}`} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe2 className="h-4 w-4 text-[#b11226]" />
                  Language Coverage
                </CardTitle>
                <CardDescription>
                  Articles currently loaded in this session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-5 pt-0">
                {languageCounts.map(({ locale, count }) => {
                  const language = languageOptions.find((item) => item.value === locale);
                  return (
                    <div key={locale} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                      <span className="text-sm font-semibold uppercase text-slate-700">
                        {language?.shortLabel ?? locale}
                      </span>
                      <span className="text-sm text-slate-500">
                        {count} article{count === 1 ? "" : "s"}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="p-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4 text-[#b11226]" />
                  Publish Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5 pt-0 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Languages className="h-4 w-4" />
                    Language
                  </span>
                  <span className="font-semibold text-slate-900">{selectedLanguage.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    Date
                  </span>
                  <span className="font-semibold text-slate-900">{form.watch("date") || "Not set"}</span>
                </div>
                {articlePreviewPath ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full bg-white"
                    onClick={() => router.push(articlePreviewPath)}
                  >
                    <Eye className="h-4 w-4" />
                    Preview Path
                  </Button>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-xs text-slate-500">
                    Preview appears after category and slug are set.
                  </div>
                )}
                {articlePreviewPath && (
                  <code className="block break-all rounded-xl bg-slate-950 px-3 py-2 text-xs text-white">
                    {articlePreviewPath}
                  </code>
                )}
              </CardContent>
            </Card>
          </aside>
          </div>
        )}
      </div>
    </div>
  );
}
