import { auth, currentUser } from '@clerk/nextjs/server';
import type { StatsigUser } from '@flags-sdk/statsig';

/** Statsig user for admin routes — uses Clerk ID and role metadata. */
export async function identifyAdminUser(): Promise<StatsigUser> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        userID: 'admin-guest',
        custom: { surface: 'admin', role: 'guest' },
      };
    }

    const user = await currentUser();
    const role = (user?.publicMetadata?.role as string | undefined) ?? 'unknown';

    return {
      userID: userId,
      email: user?.emailAddresses[0]?.emailAddress,
      custom: {
        surface: 'admin',
        role,
        isAdmin: role === 'admin',
      },
    };
  } catch {
    return {
      userID: 'admin-unknown',
      custom: { surface: 'admin' },
    };
  }
}
