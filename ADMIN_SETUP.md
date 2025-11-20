# Admin Role Setup Guide

This guide explains how to set up admin role-based access control using Clerk.

## Overview

The admin panel is protected by role-based access control. Only users with the `admin` role in their Clerk public metadata can access:
- `/admin` - Admin panel
- `/api/admin/*` - Admin API routes
- Image uploads via Uploadthing

## Setting Up Admin Role in Clerk

### Step 1: Access Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Users** in the sidebar

### Step 2: Assign Admin Role to a User

1. Find the user you want to make an admin
2. Click on the user to open their details
3. Scroll down to **Public Metadata** section
4. Click **Edit** or **Add Metadata**
5. Add the following JSON:

```json
{
  "role": "admin"
}
```

6. Click **Save**

### Step 3: Verify Admin Access

1. Sign in with the user account you just assigned the admin role
2. Navigate to `/admin`
3. You should now have access to the admin panel

## Alternative: Using Clerk Organizations (Advanced)

If you prefer using Clerk Organizations for role management:

1. Create an organization in Clerk Dashboard
2. Assign the user to the organization
3. Set the user's role in the organization to "admin"
4. Update the `isAdmin()` function in `src/lib/auth.ts` to check organization roles instead of public metadata

## Security Notes

- **Never expose admin routes to non-admin users**
- The middleware and API routes check for admin role on every request
- If a user doesn't have the admin role, they will be redirected to `/unauthorized`
- All admin API routes return 403 Forbidden if accessed without admin role

## Troubleshooting

### User can't access admin panel

1. Verify the user is signed in
2. Check that `publicMetadata.role` is set to `"admin"` (case-sensitive)
3. Clear browser cache and cookies
4. Sign out and sign back in

### Getting 403 Forbidden errors

- Ensure the user has the admin role in Clerk public metadata
- Check that the role value is exactly `"admin"` (lowercase, no spaces)

## Code References

- **Middleware**: `src/middleware.ts` - Protects admin routes
- **Auth Utility**: `src/lib/auth.ts` - `isAdmin()` function
- **Admin Page**: `src/app/admin/page.tsx` - Client-side role check
- **API Routes**: `src/app/api/admin/*` - Server-side role checks

