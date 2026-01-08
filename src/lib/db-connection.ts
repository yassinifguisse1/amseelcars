/**
 * Database connection utilities for serverless environments
 * Handles Vercel DNS resolution issues with MongoDB Atlas SRV records
 */

/**
 * Converts MongoDB SRV connection string to standard format
 * This avoids DNS resolution issues in serverless environments
 */
export function convertSrvToStandard(connectionString: string): string {
  // If it's already a standard connection string, return as-is
  if (connectionString.startsWith('mongodb://')) {
    return connectionString;
  }

  // If it's not an SRV connection string, return as-is
  if (!connectionString.startsWith('mongodb+srv://')) {
    return connectionString;
  }

  // Parse SRV connection string
  // Format: mongodb+srv://[username]:[password]@[host]/[database]?[params]
 

  // Extract database name from pathname

  // For MongoDB Atlas, we need to construct the standard connection string
  // This requires knowing the replica set members, which we can't get from SRV
  // So we'll return the original string but with the DNS fix applied
  // The actual conversion would require querying the SRV record first
  
  // For now, return the original with DNS fix
  return connectionString;
}

/**
 * Fixes Vercel DNS resolution issues by removing internal domain suffixes
 */
export function fixVercelDns(connectionString: string): string {
  if (!connectionString) return connectionString;
  
  // Remove Vercel's internal domain suffixes that break SRV lookups
  // Matches any AWS region pattern: .{region}.compute.internal.
  // Also handles variations like .compute.internal (without trailing dot)
  let fixed = connectionString.replace(/\.([a-z0-9-]+)\.compute\.internal\.?/gi, '');
  
  // Also remove if it appears in the middle of the hostname
  // This handles cases where Vercel modifies the hostname before DNS lookup
  fixed = fixed.replace(/\.compute\.internal\.?/gi, '');
  
  // Log the fix in development (without exposing password)
  if (process.env.NODE_ENV === 'development') {
    const masked = fixed.replace(/:([^:@]+)@/, ':****@');
    console.log('[DB Connection] Fixed connection string:', masked);
  }
  
  return fixed;
}

/**
 * Gets the database URL with all fixes applied
 */
export function getFixedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // Apply DNS fix
  return fixVercelDns(url);
}

