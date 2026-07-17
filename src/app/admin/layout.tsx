import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AdminStatsigProvider } from "@/components/admin/AdminStatsigProvider";
import { getAdminStatsigBootstrap } from "@/lib/statsig/bootstrap";
import { getStatsigClientKey, isStatsigConfigured } from "@/lib/statsig/config";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const configured = isStatsigConfigured();
  const statsigBootstrap = configured ? await getAdminStatsigBootstrap() : null;
  const clientKey = configured ? getStatsigClientKey() : null;

  const body = (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      {statsigBootstrap && clientKey ? (
        <AdminStatsigProvider datafile={statsigBootstrap} clientKey={clientKey}>
          {children}
        </AdminStatsigProvider>
      ) : (
        children
      )}
    </>
  );

  return <ClerkProvider>{body}</ClerkProvider>;
}
