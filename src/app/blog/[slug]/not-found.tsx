import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Article non trouvé - AmseelCars Blog',
  description: 'L\'article demandé n\'a pas été trouvé dans notre blog.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Article non trouvé
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          L'article que vous recherchez n'existe pas ou a été déplacé.
        </p>
        <div className="space-y-4">
          <Link 
            href="/blog"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retour au blog
          </Link>
          <div className="block">
            <Link 
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



