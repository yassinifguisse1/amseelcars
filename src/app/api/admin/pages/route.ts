import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to check if user is admin
async function isAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }
  
  // You can add additional admin checks here if needed
  return true;
}

// GET - Fetch pages or a specific page
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slugsOnly = searchParams.get('slugsOnly') === 'true';

    // Fetch specific page by ID
    if (id) {
      const page = await prisma.page.findUnique({
        where: { id },
      });

      if (!page) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ page });
    }

    // Fetch all pages (slugs only or full data)
    if (slugsOnly) {
      const pages = await prisma.page.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          published: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return NextResponse.json({ pages });
    }

    // Fetch all pages with full data
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      content,
      description,
      image,
      altText,
      published,
      indexable,
      seo,
    } = body;

    // Validate required fields
    if (!slug || !title || !content || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    // Create the page
    const page = await prisma.page.create({
      data: {
        slug,
        title,
        content,
        description,
        image: image || null,
        altText: altText || null,
        published: published ?? false,
        indexable: indexable ?? true,
        seo: seo || {},
        createdBy: userId,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing page
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      content,
      description,
      image,
      altText,
      published,
      indexable,
      seo,
    } = body;

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingPage.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update the page
    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(content && { content }),
        ...(description && { description }),
        ...(image !== undefined && { image }),
        ...(altText !== undefined && { altText }),
        ...(published !== undefined && { published }),
        ...(indexable !== undefined && { indexable }),
        ...(seo && { seo }),
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Delete the page
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
