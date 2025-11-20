import { PrismaClient } from '@prisma/client';
// Import from backup file that contains original articles
// @ts-ignore - We're importing from a backup file
import { blogArticles } from './blog-articles-backup';

const prisma = new PrismaClient();

async function migrateArticles() {
  console.log('🚀 Starting article migration...\n');
  
  // Use a placeholder user ID for migration
  // You can update this later with actual Clerk user IDs if needed
  const PLACEHOLDER_USER_ID = 'system-migration';
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (const article of blogArticles) {
    try {
      // Check if article already exists
      const existing = await prisma.blogArticle.findUnique({
        where: { slug: article.slug },
      });
      
      if (existing) {
        console.log(`⚠️  Article "${article.slug}" already exists, skipping...`);
        skippedCount++;
        continue;
      }
      
      // Transform article data to match database schema
      const articleData = {
        slug: article.slug,
        title: article.title,
        content: article.content,
        category: article.category,
        readTime: article.readTime,
        date: article.date,
        publishedAt: new Date(article.publishedAt),
        image: article.image, // Keep local paths as-is
        altText: article.altText,
        caption: article.caption || '',
        description: article.description,
        featured: article.featured,
        indexable: (article as any).indexable ?? true, // Default to true if not specified
        tags: article.tags,
        author: article.author, // Will be stored as JSON
        seo: article.seo, // Will be stored as JSON
        createdBy: PLACEHOLDER_USER_ID,
      };
      
      await prisma.blogArticle.create({
        data: articleData,
      });
      
      console.log(`✅ Migrated: ${article.slug}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Error migrating "${article.slug}":`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📝 Total: ${blogArticles.length}`);
  
  if (successCount > 0) {
    console.log('\n✨ Migration completed successfully!');
  }
}

migrateArticles()
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

