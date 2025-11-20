import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { articleSchema } from '@/lib/validations/article';
import { isAdmin } from '@/lib/auth';
import { BlogArticle } from '@/data/blog';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get user info
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
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
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
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

    return NextResponse.json(
      { message: 'Article created successfully', article },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating article:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create article', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
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
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
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
      
      return NextResponse.json({
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to fetch articles', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get article ID from query parameters
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Check if article exists
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete the article
    await prisma.blogArticle.delete({
      where: { id: articleId },
    });

    return NextResponse.json(
      { message: 'Article deleted successfully', deletedArticle: { id: articleId, slug: article.slug } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting article:', error);
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete article', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('[PUT /api/admin/articles] User authenticated:', userId);

    // Check admin role
    const admin = await isAdmin();
    if (!admin) {
      console.log('[PUT /api/admin/articles] Forbidden: Not admin');
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    console.log('[PUT /api/admin/articles] Admin role confirmed');

    // Get article ID from query parameters
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');
    console.log('[PUT /api/admin/articles] Article ID:', articleId);

    if (!articleId) {
      console.log('[PUT /api/admin/articles] Bad request: No article ID');
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
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
        return NextResponse.json(
          { error: 'An article with this slug already exists' },
          { status: 400 }
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

    return NextResponse.json(
      { message: 'Article updated successfully', article: updatedArticle },
      { status: 200 }
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
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
      if (error.code === 'P2010') {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.', message: error instanceof Error ? error.message : 'Connection timeout' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update article', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

