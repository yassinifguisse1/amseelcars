# MongoDB DNS Resolution Fix - Summary

## Changes Made

### 1. Enhanced DNS Fix (`src/lib/prisma.ts` & `src/lib/db-connection.ts`)
- Removes all Vercel internal domain suffixes (`.compute.internal.` from any AWS region)
- Added validation to catch any remaining issues
- Added debug logging in development mode

### 2. Connection Retry Logic (`src/app/api/admin/articles/route.ts`)
- Added automatic retry (up to 3 attempts) for connection errors
- Exponential backoff between retries
- Specifically handles DNS resolution and timeout errors

## Important: Verify Your Vercel Environment Variable

The error shows it's trying to resolve `cluster0.xxxxx.mongodb.net` but your connection string uses `amseel.kafgasi.mongodb.net`. This suggests:

1. **The environment variable might not be updated in Vercel**
2. **There might be a deployment cache issue**

### Steps to Verify:

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Click on `DATABASE_URL`** to view/edit it
3. **Verify the connection string is exactly:**
   ```
   mongodb+srv://amseelcars5_db_user:uVpQAqCM5CGNCyK3@amseel.kafgasi.mongodb.net/amseelcars?retryWrites=true&w=majority&ssl=true&tls=true&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
   ```
4. **Check that it applies to "Production" environment** (or "All Environments")
5. **Save** if you made any changes
6. **Redeploy** your application (even if you didn't change anything, this clears caches)

## After Redeploying

1. Wait for the deployment to complete
2. Test the `/api/admin/articles` endpoint
3. Check Vercel logs - you should see:
   - Retry attempts if there are connection issues
   - No more DNS resolution errors

## If Still Not Working

### Option 1: Clear Vercel Cache
1. Go to Vercel Dashboard → Your Project → **Settings** → **Functions**
2. Look for any cache settings and clear them
3. Redeploy

### Option 2: Use Standard Connection String
If SRV continues to fail, get the standard connection string from MongoDB Atlas:
1. MongoDB Atlas → Clusters → Connect → **"Connection String"** tab
2. Look for "Standard connection string" (not SRV)
3. It should look like:
   ```
   mongodb://amseel-shard-00-00.kafgasi.mongodb.net:27017,amseel-shard-00-01.kafgasi.mongodb.net:27017,amseel-shard-00-02.kafgasi.mongodb.net:27017/amseelcars?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
   ```
4. Replace `DATABASE_URL` in Vercel with this standard format
5. Redeploy

### Option 3: Check MongoDB Atlas Network Access
1. MongoDB Atlas → **Network Access**
2. Ensure `0.0.0.0/0` is allowed (or Vercel IPs are whitelisted)
3. Check that your database user has proper permissions

## Debug Information

The code now logs connection string fixes in development mode. Check your local logs when running `npm run dev` to see if the DNS fix is being applied correctly.

