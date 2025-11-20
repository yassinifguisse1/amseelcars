# MongoDB Connection Error Troubleshooting

## Error Analysis
```
I/O error: received fatal alert: InternalError
Server selection timeout: No available servers
ReplicaSetNoPrimary
```

This indicates a **TLS/SSL handshake failure** between Vercel and MongoDB Atlas.

## Root Causes (Most Common)

### 1. Connection String Missing Serverless Parameters ⚠️ **MOST LIKELY**

Your MongoDB connection string needs specific parameters for serverless environments like Vercel.

**Current format (likely):**
```
mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

**Required format for Vercel:**
```
mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl=true&tls=true&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
```

**Key parameters:**
- `connectTimeoutMS=10000` - Connection timeout (10s)
- `socketTimeoutMS=45000` - Socket timeout (45s, under Vercel's 60s limit)
- `maxPoolSize=10` - Limit connections per instance
- `maxIdleTimeMS=30000` - Close idle connections after 30s
- `tls=true` - Explicitly enable TLS

### 2. MongoDB Atlas Network Access 🔒

Vercel's IP addresses might not be whitelisted.

**Fix:**
1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - OR add Vercel's IP ranges (more secure but requires maintenance)

### 3. Password Contains Special Characters 🔑

If your MongoDB password has special characters (`@`, `#`, `%`, etc.), they must be URL-encoded in the connection string.

**Example:**
- Password: `P@ssw0rd#123`
- Encoded: `P%40ssw0rd%23123`

**URL encoding reference:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`

### 4. Database User Permissions 👤

Ensure your MongoDB user has proper permissions:
1. Go to MongoDB Atlas → **Database Access**
2. Check your user has **"Read and write to any database"** or specific database access

## Step-by-Step Fix

### Step 1: Update Connection String in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Update it with the full connection string including all parameters:

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority&ssl=true&tls=true&connectTimeoutMS=10000&socketTimeoutMS=45000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000
```

**Replace:**
- `USERNAME` - Your MongoDB username
- `PASSWORD` - Your MongoDB password (URL-encode if needed)
- `CLUSTER` - Your cluster connection string
- `DATABASE_NAME` - Your database name

### Step 2: Verify Network Access

1. MongoDB Atlas → **Network Access**
2. Ensure `0.0.0.0/0` is in the list (or Vercel IPs)

### Step 3: Test Connection

1. **Redeploy** your Vercel application
2. Test the `/api/admin/articles` endpoint
3. Check Vercel logs for connection errors

## Quick Test: Verify Connection String Format

You can test your connection string locally:

```bash
# In your terminal
node -e "const { MongoClient } = require('mongodb'); const uri = 'YOUR_CONNECTION_STRING'; MongoClient.connect(uri, { serverSelectionTimeoutMS: 5000 }, (err, client) => { if (err) console.error('Error:', err.message); else { console.log('Connected!'); client.close(); } });"
```

## Alternative: Use Prisma Data Proxy (Recommended for Production)

For better serverless performance, use Prisma Accelerate:

```bash
npx prisma generate --accelerate
```

This creates a connection pool that handles serverless environments better.

## Still Not Working?

1. **Check MongoDB Atlas Status**: https://status.mongodb.com/
2. **Verify Cluster is Running**: MongoDB Atlas → Clusters → Check status
3. **Check Vercel Logs**: Look for more detailed error messages
4. **Test with MongoDB Compass**: Try connecting with MongoDB Compass using the same connection string

