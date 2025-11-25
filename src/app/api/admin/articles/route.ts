import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { articleSchema } from '@/lib/validations/article';
import { isAdmin } from '@/lib/auth';
import { BlogArticle } from '@/data/blog';
import { ZodError } from 'zod';

// Force dynamic rendering - prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to create response with no-cache headers
function createNoCacheResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createNoCacheResponse(
        { error: 'Unauthorized' },
        401
      );
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return createNoCacheResponse(
        { error: 'Forbidden: Admin access required' },
        403
      );
    }

    // Get user info
    const user = await currentUser();
    if (!user) {
      return createNoCacheResponse(
        { error: 'User not found' },
        401
      );
    }

    // Parse and validate request body first (before database calls)
    const body = await request.json();
    const validatedData = articleSchema.parse(body);

    // Helper function for retrying database operations
    const retryDbOperation = async <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          return await operation();
        } catch (error: unknown) {
          retryCount++;
          const isConnectionError = 
            error instanceof Error && 
            (error.message.includes('DNS resolution') || 
             error.message.includes('timeout') ||
             error.message.includes('connection') ||
             (error as { code?: string }).code === 'P2010');
          
          if (isConnectionError && retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            console.warn(`Retrying ${operationName} (attempt ${retryCount + 1}/${maxRetries})...`);
            continue;
          }
          throw error; // Re-throw if not a connection error or max retries reached
        }
      }
      throw new Error(`Failed ${operationName} after ${maxRetries} retries`);
    };

    // Check if slug already exists with retry
    const existingArticle = await retryDbOperation(
      () => prisma.blogArticle.findUnique({
        where: { slug: validatedData.slug },
      }),
      'check slug existence'
    );

    if (existingArticle) {
      return createNoCacheResponse(
        { error: 'An article with this slug already exists' },
        400
      );
    }

    // Create article with retry
    const article = await retryDbOperation(
      () => prisma.blogArticle.create({
        data: {
          slug: validatedData.slug,
          title: validatedData.title,
          content: validatedData.content,
          category: validatedData.category,
          readTime: validatedData.readTime,
          date: validatedData.date,
          publishedAt: new Date(validatedData.publishedAt),
          image: validatedData.image,
          altText: validatedData.altText,
          caption: validatedData.caption || '',
          description: validatedData.description,
          featured: validatedData.featured,
          indexable: validatedData.indexable ?? true,
          tags: validatedData.tags,
          author: validatedData.author,
          seo: validatedData.seo,
          createdBy: userId,
        },
      }),
      'create article'
    );

    // Return with no-cache headers
    return createNoCacheResponse(
      { message: 'Article created successfully', article },
      201
    );
  } catch (error: unknown) {
    console.error('Error creating article:', error);
    
    if (error instanceof ZodError) {
      return createNoCacheResponse(
        { error: 'Validation error', details: error.issues },
        400
      );
    }

    return createNoCacheResponse(
      { error: 'Failed to create article', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createNoCacheResponse(
        { error: 'Unauthorized' },
        401
      );
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return createNoCacheResponse(
        { error: 'Forbidden: Admin access required' },
        403
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const slugsOnly = searchParams.get('slugsOnly') === 'true';
    const articleId = searchParams.get('id');
    
    // Get single article by ID for editing
    if (articleId && !slugsOnly) {
      const article = await prisma.blogArticle.findUnique({
        where: { id: articleId },
      });
      
      if (!article) {
        return createNoCacheResponse(
          { error: 'Article not found' },
          404
        );
      }
      console.log('[GET /api/admin/articles] Article found:', article);
      
      // Return with no-cache headers to ensure fresh data
      return createNoCacheResponse({
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          content: article.content,
          category: article.category,
          readTime: article.readTime,
          date: article.date,
          publishedAt: article.publishedAt.toISOString(),
          image: article.image,
          altText: article.altText,
          caption: article.caption,
          description: article.description,
          featured: article.featured,
          indexable: article.indexable ?? true,
          tags: article.tags,
          author: article.author as BlogArticle['author'],
          seo: article.seo as BlogArticle['seo'],
        },
      });
    }

    if (slugsOnly) {
      // Return only id, slug, and category for the list view
      // Add retry logic for serverless connection issues
      let articles;
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          articles = await prisma.blogArticle.findMany({
            select: {
              id: true,
              slug: true,
              category: true,
            },
            orderBy: { publishedAt: 'desc' },
          });
          break; // Success, exit retry loop
        } catch (error: unknown) {
          retryCount++;
          const isConnectionError = 
            error instanceof Error && 
            (error.message.includes('DNS resolution') || 
             error.message.includes('timeout') ||
             error.message.includes('connection') ||
             (error as { code?: string }).code === 'P2010');
          
          if (isConnectionError && retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            console.warn(`Retrying database query (attempt ${retryCount + 1}/${maxRetries})...`);
            continue;
          }
          throw error; // Re-throw if not a connection error or max retries reached
        }
      }
      
      if (!articles) {
        throw new Error('Failed to fetch articles after retries');
      }
      console.log('[GET /api/admin/articles] Articles found:', articles);
      
      // Return with no-cache headers to ensure fresh data
      return createNoCacheResponse({
        articles,
        total: articles.length,
      });
    }

    // Full article data with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get articles with retry logic for serverless connection issues
    let articles, total;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        [articles, total] = await Promise.all([
          prisma.blogArticle.findMany({
            skip,
            take: limit,
            orderBy: { publishedAt: 'desc' },
          }),
          prisma.blogArticle.count(),
        ]);
        break; // Success, exit retry loop
      } catch (error: unknown) {
        retryCount++;
        const isConnectionError = 
          error instanceof Error && 
          (error.message.includes('DNS resolution') || 
           error.message.includes('timeout') ||
           error.message.includes('connection') ||
           (error as { code?: string }).code === 'P2010');
        
        if (isConnectionError && retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
          console.warn(`Retrying database query (attempt ${retryCount + 1}/${maxRetries})...`);
          continue;
        }
        throw error; // Re-throw if not a connection error or max retries reached
      }
    }
    
    if (!articles || total === undefined) {
      throw new Error('Failed to fetch articles after retries');
    }
    console.log('[GET /api/admin/articles] Articles found:', articles);
    // Return with no-cache headers to ensure fresh data
    return createNoCacheResponse({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching articles:', error);
    return createNoCacheResponse(
      { error: 'Failed to fetch articles', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createNoCacheResponse(
        { error: 'Unauthorized' },
        401
      );
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return createNoCacheResponse(
        { error: 'Forbidden: Admin access required' },
        403
      );
    }

    // Get article ID from query parameters
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return createNoCacheResponse(
        { error: 'Article ID is required' },
        400
      );
    }

    // Check if article exists
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return createNoCacheResponse(
        { error: 'Article not found' },
        404
      );
    }

    // Delete the article
    await prisma.blogArticle.delete({
      where: { id: articleId },
    });

    return createNoCacheResponse(
      { message: 'Article deleted successfully', deletedArticle: { id: articleId, slug: article.slug } },
      200
    );
  } catch (error: unknown) {
    console.error('Error deleting article:', error);
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return createNoCacheResponse(
        { error: 'Article not found' },
        404
      );
    }

    return createNoCacheResponse(
      { error: 'Failed to delete article', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  console.log('[PUT /api/admin/articles] Request received');
  
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log('[PUT /api/admin/articles] Unauthorized: No userId');
      return createNoCacheResponse(
        { error: 'Unauthorized' },
        401
      );
    }
    console.log('[PUT /api/admin/articles] User authenticated:', userId);

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      console.log('[PUT /api/admin/articles] Forbidden: Not admin');
      return createNoCacheResponse(
        { error: 'Forbidden: Admin access required' },
        403
      );
    }
    console.log('[PUT /api/admin/articles] Admin role confirmed');

    // Get article ID from query parameters
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');
    console.log('[PUT /api/admin/articles] Article ID:', articleId);

    if (!articleId) {
      console.log('[PUT /api/admin/articles] Bad request: No article ID');
      return createNoCacheResponse(
        { error: 'Article ID is required' },
        400
      );
    }

    // Parse and validate request body first (before database calls)
    const body = await request.json();
    const validatedData = articleSchema.parse(body);

    // Helper function for retrying database operations
    const retryDbOperation = async <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          return await operation();
        } catch (error: unknown) {
          retryCount++;
          const isConnectionError = 
            error instanceof Error && 
            (error.message.includes('DNS resolution') || 
             error.message.includes('timeout') ||
             error.message.includes('connection') ||
             (error as { code?: string }).code === 'P2010');
          
          if (isConnectionError && retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            console.warn(`Retrying ${operationName} (attempt ${retryCount + 1}/${maxRetries})...`);
            continue;
          }
          throw error; // Re-throw if not a connection error or max retries reached
        }
      }
      throw new Error(`Failed ${operationName} after ${maxRetries} retries`);
    };

    // Check if article exists with retry
    const existingArticle = await retryDbOperation(
      () => prisma.blogArticle.findUnique({
        where: { id: articleId },
      }),
      'find article'
    );

    if (!existingArticle) {
      return createNoCacheResponse(
        { error: 'Article not found' },
        404
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (validatedData.slug !== existingArticle.slug) {
      const slugExists = await retryDbOperation(
        () => prisma.blogArticle.findUnique({
          where: { slug: validatedData.slug },
        }),
        'check slug uniqueness'
      );

      if (slugExists) {
        return createNoCacheResponse(
          { error: 'An article with this slug already exists' },
          400
        );
      }
    }

    // Update the article with retry
    console.log('[PUT /api/admin/articles] Updating article:', {
      id: articleId,
      slug: validatedData.slug,
      title: validatedData.title.substring(0, 50) + '...',
    });
    
    const updatedArticle = await retryDbOperation(
      () => prisma.blogArticle.update({
        where: { id: articleId },
        data: {
          slug: validatedData.slug,
          title: validatedData.title,
          content: validatedData.content,
          category: validatedData.category,
          readTime: validatedData.readTime,
          date: validatedData.date,
          publishedAt: new Date(validatedData.publishedAt),
          image: validatedData.image,
          altText: validatedData.altText,
          caption: validatedData.caption || '',
          description: validatedData.description,
          featured: validatedData.featured,
          indexable: validatedData.indexable ?? true,
          tags: validatedData.tags,
          author: validatedData.author,
          seo: validatedData.seo,
        },
      }),
      'update article'
    );

    const duration = Date.now() - startTime;
    console.log(`[PUT /api/admin/articles] Article updated successfully in ${duration}ms:`, {
      id: updatedArticle.id,
      slug: updatedArticle.slug,
    });

    // Return with no-cache headers to ensure fresh data
    return createNoCacheResponse(
      { message: 'Article updated successfully', article: updatedArticle },
      200
    );
  } catch (error: unknown) {
    console.error('Error updating article:', error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Error code:', error.code);
    }
    
    if (error instanceof ZodError) {
      return createNoCacheResponse(
        { error: 'Validation error', details: error.issues },
        400
      );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return createNoCacheResponse(
          { error: 'Article not found' },
          404
        );
      }
      if (error.code === 'P2010') {
        return createNoCacheResponse(
          { error: 'Database connection error. Please try again.', message: error instanceof Error ? error.message : 'Connection timeout' },
          503
        );
      }
    }

    return createNoCacheResponse(
      { error: 'Failed to update article', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

