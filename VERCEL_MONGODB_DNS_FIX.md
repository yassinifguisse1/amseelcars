# Fix: MongoDB DNS Resolution Error in Vercel Production

## Problem
```
Error in connector: Error creating a database connection. 
(Kind: An error occurred during DNS resolution: no record found for Query 
{ name: Name("_mongodb._tcp.cluster0.xxxxx.mongodb.net.eu-west-3.compute.internal."), 
query_type: SRV, query_class: IN })
```

**Root Cause:** Vercel's DNS resolver is appending `.eu-west-3.compute.internal.` to your MongoDB hostname, breaking SRV record lookups for `mongodb+srv://` connection strings.

## Solution 1: Use Standard Connection String (Recommended) ✅

MongoDB Atlas provides both SRV (`mongodb+srv://`) and standard (`mongodb://`) connection strings. Use the **standard connection string** for Vercel.

### Steps:

1. **Get Standard Connection String from MongoDB Atlas:**
   - Go to MongoDB Atlas → **Clusters** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Select **"Driver"** (e.g., Node.js) and **"Version"** (e.g., 5.5 or later)
   - **IMPORTANT:** Look for the **"Standard connection string"** option (not SRV)
   - It should look like:
     ```
     mongodb://cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
     ```

2. **Add Serverless Parameters:**
   Append these parameters to your connection string:
   ```
   &connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
   ```

3. **Full Example:**
   ```
   mongodb://cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
   ```

4. **Update in Vercel:**
   - Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
   - Update `DATABASE_URL` with the standard connection string (not SRV)
   - **Redeploy** your application

## Solution 2: Fix SRV Connection String (If you must use SRV)

If you need to use `mongodb+srv://`, ensure your connection string is properly formatted:

1. **Get SRV Connection String from MongoDB Atlas:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority
   ```

2. **Add Serverless Parameters:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority&ssl=true&tls=true&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
   ```

3. **Important:** Make sure there are **NO spaces** or **special characters** that need encoding in the hostname part.

## Solution 3: Use Prisma Connection Pooling (Advanced)

If the above doesn't work, you can configure Prisma to handle DNS resolution better:

Update `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Force DNS resolution settings for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace(/\.eu-west-3\.compute\.internal\.?$/, ''),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## Why This Happens

Vercel's serverless functions run in AWS Lambda-like environments. The DNS resolver in these environments sometimes appends internal domain suffixes (like `.eu-west-3.compute.internal.`) to hostnames, which breaks SRV record lookups for MongoDB Atlas.

**Standard connection strings** (`mongodb://`) don't rely on SRV records, so they work better in serverless environments.

## Verification

After updating your connection string:

1. **Redeploy** your Vercel application
2. Test the `/api/admin/articles` endpoint
3. Check Vercel logs - you should no longer see DNS resolution errors

## Quick Checklist

- [ ] Get standard connection string from MongoDB Atlas (not SRV)
- [ ] Add serverless parameters (`connectTimeoutMS`, `socketTimeoutMS`, etc.)
- [ ] Update `DATABASE_URL` in Vercel environment variables
- [ ] URL-encode any special characters in password
- [ ] Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] Redeploy application
- [ ] Test connection

