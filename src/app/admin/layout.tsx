import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AdminStatsigProvider } from "@/components/admin/AdminStatsigProvider";
import { getAdminStatsigBootstrap } from "@/lib/statsig/bootstrap";
import { isStatsigConfigured } from "@/lib/statsig/config";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const statsigBootstrap = isStatsigConfigured()
    ? await getAdminStatsigBootstrap()
    : null;

  const body = (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      {statsigBootstrap ? (
        <AdminStatsigProvider datafile={statsigBootstrap}>{children}</AdminStatsigProvider>
      ) : (
        children
      )}
    </>
  );

  return <ClerkProvider>{body}</ClerkProvider>;
}
