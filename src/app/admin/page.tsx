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
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [articles, setArticles] = useState<Array<{ id: string; slug: string; category: string }>>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);

  // Fetch articles list (only slugs)
  const fetchArticles = async () => {
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const response = await fetch('/api/admin/articles?slugsOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data.articles || []);
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
      const response = await fetch(`/api/admin/articles?id=${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      const article = data.article;
      
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
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      console.error('Error deleting article:', error);
      setArticlesError(error instanceof Error ? error.message : 'Failed to delete article');
    } finally {
      setDeletingArticleId(null);
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
    if (activeTab === 'list' && isAdmin) {
      fetchArticles();
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingArticleId ? 'update' : 'create'} article`);
      }

      setSubmitSuccess(true);
      form.reset();
      setEditingArticleId(null);
      
      // Refresh articles list if on list tab
      if (activeTab === 'list') {
        fetchArticles();
      }
      
      // Redirect to article list or show success message
      setTimeout(() => {
        if (activeTab === 'create') {
          setActiveTab('list');
        }
      }, 2000);
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : `Failed to ${editingArticleId ? 'update' : 'create'} article`);
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
                {activeTab === 'list' 
                  ? 'Article deleted successfully!'
                  : editingArticleId
                  ? 'Article updated successfully! Redirecting...'
                  : 'Article created successfully! Redirecting...'}
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

        {/* Articles List Tab */}
        {activeTab === 'list' ? (
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
