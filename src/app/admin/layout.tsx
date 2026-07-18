import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AdminStatsigProvider } from "@/components/admin/AdminStatsigProvider";
import { getAdminStatsigBootstrap } from "@/lib/statsig/bootstrap";
import { getStatsigClientKey, isStatsigConfigured } from "@/lib/statsig/config";

export const metadata: Metadata = {
  title: "Amseel Admin",
  description: "Panneau d’administration Amseel Cars",
  robots: { index: false, follow: false },
  applicationName: "Amseel Admin",
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Amseel Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/admin/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/admin/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
