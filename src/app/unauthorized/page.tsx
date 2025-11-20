import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This page is restricted to administrators only. If you believe this is an error, please contact the system administrator.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
            <SignOutButton>
              <Button variant="default">Sign Out</Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

