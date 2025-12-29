"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { articleSchema, type ArticleFormData } from '@/lib/validations/article';
import { categoryToSlug } from '@/data/blog';
import { Loader2, LogOut, Plus, FileJson, List, Trash2, Edit, X } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { useEffect } from 'react';

const categories = [
  'Guide Pratique',
  'Actualités',
  'Conseils',
  'Avis',
];

export default function AdminPage() {
  const { user } = useUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'pages'>('create');
  const [articles, setArticles] = useState<Array<{ id: string; slug: string; category: string }>>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [lastSuccessOperation, setLastSuccessOperation] = useState<'create' | 'update' | 'delete' | null>(null);
  
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
        title: article.title,
        content: article.content,
        category: article.category,
        readTime: article.readTime,
        date: article.date,
        publishedAt: article.publishedAt,
        image: article.image,
        altText: article.altText,
        caption: article.caption || '',
        description: article.description,
        featured: article.featured,
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
    if (activeTab === 'list' && isAdmin) {
      fetchArticles();
    }
    if (activeTab === 'pages' && isAdmin) {
      fetchPages();
    }
  }, [activeTab, isAdmin]);

  const form = useForm<ArticleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(articleSchema) as any,
    defaultValues: {
      slug: '',
      title: '',
      content: '',
      category: '',
      readTime: '',
      date: '',
      publishedAt: new Date().toISOString(),
      image: '',
      altText: '',
      caption: '',
      description: '',
      featured: false,
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <SignOutButton>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('create');
              if (!editingArticleId) {
                cancelEdit();
              }
            }}
            className={`rounded-b-none border-b-2 ${
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent'
            }`}
            size="sm"
          >
            {editingArticleId ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Article
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Article
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('list');
              cancelEdit();
            }}
            className={`rounded-b-none border-b-2 ${
              activeTab === 'list'
                ? 'border-primary text-primary'
                : 'border-transparent'
            }`}
            size="sm"
          >
            <List className="mr-2 h-4 w-4" />
            Articles List
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('pages');
              cancelEdit();
              cancelPageEdit();
            }}
            className={`rounded-b-none border-b-2 ${
              activeTab === 'pages'
                ? 'border-primary text-primary'
                : 'border-transparent'
            }`}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Pages
          </Button>
          {editingArticleId && (
            <Button
              variant="ghost"
              onClick={cancelEdit}
              size="sm"
              className="ml-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Edit
            </Button>
          )}
        </div>

        {/* Mode Toggle (only show in create tab) */}
        {activeTab === 'create' && (
          <div className="mb-6 flex gap-2">
            <Button
              variant={!jsonMode ? 'default' : 'outline'}
              onClick={() => setJsonMode(false)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Form Mode
            </Button>
            <Button
              variant={jsonMode ? 'default' : 'outline'}
              onClick={() => setJsonMode(true)}
              size="sm"
            >
              <FileJson className="mr-2 h-4 w-4" />
              JSON Mode
            </Button>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <p className="text-green-700 dark:text-green-300">
                {lastSuccessOperation === 'delete'
                  ? activeTab === 'pages' ? 'Page deleted successfully!' : 'Article deleted successfully!'
                  : lastSuccessOperation === 'update'
                  ? activeTab === 'pages' ? 'Page updated successfully!' : 'Article updated successfully! Redirecting...'
                  : lastSuccessOperation === 'create'
                  ? activeTab === 'pages' ? 'Page created successfully!' : 'Article created successfully! Redirecting...'
                  : 'Operation completed successfully!'}
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

        {/* Pages Tab */}
        {activeTab === 'pages' ? (
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
                          <span className={`text-xs px-2 py-1 rounded ${
                            page.published 
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
                                router.push(`/blog/${categorySlug}/${article.slug}`);
                              }}
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
  "title": "Example Title",
  "content": "<p>Article content...</p>",
  "category": "Guide Pratique",
  "readTime": "6 min",
  "date": "02 novembre 2025",
  "publishedAt": "2025-11-02T10:00:00Z",
  "image": "/images/blog/example.webp",
  "altText": "Example image",
  "caption": "Optional caption",
  "description": "Article description",
  "featured": false,
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
                  <strong>Note:</strong> The <code className="bg-muted px-1 py-0.5 rounded">indexable</code> field controls search engine indexing. 
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
          <Card>
            <CardHeader>
              <CardTitle>{editingArticleId ? 'Edit Article' : 'Create New Article'}</CardTitle>
              <CardDescription>
                {editingArticleId 
                  ? 'Update the article details below.'
                  : 'Fill out the form below to create a new blog article.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Content</h3>
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Article content (HTML)"
                              className="min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Media</h3>
                    
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

                    <FormField
                      control={form.control}
                      name="altText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text *</FormLabel>
                          <FormControl>
                            <Input placeholder="Image alt text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="caption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caption</FormLabel>
                          <FormControl>
                            <Input placeholder="Image caption (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* SEO */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">SEO</h3>
                    
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tags & Settings</h3>
                    
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
                      className={editingArticleId ? 'flex-1' : 'w-full'}
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
        )}
    </div>
    </div>
  );
}
