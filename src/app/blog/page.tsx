import { LoadingProvider } from "@/contexts/LoadingContext";
import { Metadata } from 'next';
import { HomeContent } from "./HomeContent";

export const metadata: Metadata = {
  title: "Blog AmseelCars - Conseils & Actualités Location Voiture Agadir",
  description:
    "Découvrez nos conseils pour la location de voiture à Agadir, actualités du secteur automobile et guides pratiques pour vos déplacements au Maroc.",
  alternates: { canonical: "/blog" },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    images: ["/og/amseel-car-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AmseelCars — Location de voitures à Agadir",
    description:
      "Location de voitures à Agadir au meilleur prix. Large flotte (citadines, SUV, premium).",
    images: ["/og/amseel-car-logo.png"], // ← same image
  },
};

export default function BlogPage() {
  return (
    <LoadingProvider>
      <HomeContent />
    </LoadingProvider>
  );
}
