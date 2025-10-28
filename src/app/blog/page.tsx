import { LoadingProvider } from "@/contexts/LoadingContext";
import { Metadata } from 'next';
import { HomeContent } from "./HomeContent";

export const metadata: Metadata = {
  title: "Blog AmseelCars - Conseils & Actualités Location Voiture Agadir",
  description:
    "Découvrez nos conseils pour la location de voiture à Agadir, actualités du secteur automobile et guides pratiques pour vos déplacements au Maroc.",
  alternates: { canonical: "/blog" },
  openGraph: {
    images: ["/og/og-default.jpg"],
  },
};

export default function BlogPage() {
  return (
    <LoadingProvider>
      <HomeContent />
    </LoadingProvider>
  );
}
