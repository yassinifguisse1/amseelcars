import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Check if the current user has admin role
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await currentUser();
    if (!user) return false;

    // Check public metadata for admin role
    const role = user.publicMetadata?.role as string | undefined;
    return role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

/**
 * Get the current user's role
 * @returns user role or null
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    return (user.publicMetadata?.role as string | undefined) || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

