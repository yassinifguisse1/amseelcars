export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  publishedAt: string;
  image: string;
  featured: boolean;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonical: string;
  };
}

export const blogArticles: BlogArticle[] = [
  {
    id: 1,
    slug: "guide-location-voiture-aeroport-agadir",
    title: "Guide Complet: Location de Voiture à l'Aéroport d'Agadir",
    excerpt: "Tout ce que vous devez savoir pour réserver et récupérer votre voiture de location directement à l'aéroport d'Agadir-Al Massira.",
    content: `
      <h2>Pourquoi Choisir la Location à l'Aéroport ?</h2>
      <p>La location de voiture directement à l'aéroport d'Agadir-Al Massira offre de nombreux avantages pour les voyageurs. Vous évitez les trajets supplémentaires et commencez votre séjour au Maroc dès votre arrivée.</p>
      
      <h3>Avantages de la Location Aéroport</h3>
      <ul>
        <li><strong>Gain de temps :</strong> Récupération immédiate de votre véhicule</li>
        <li><strong>Confort :</strong> Pas de transport supplémentaire avec vos bagages</li>
        <li><strong>Flexibilité :</strong> Départ immédiat vers votre destination</li>
        <li><strong>Sécurité :</strong> Véhicules entretenus et assurés</li>
      </ul>

      <h2>Comment Réserver votre Voiture</h2>
      <p>Chez AmseelCars, nous simplifions le processus de réservation pour vous offrir la meilleure expérience possible.</p>

      <h3>Étapes de Réservation</h3>
      <ol>
        <li><strong>Consultation en ligne :</strong> Parcourez notre flotte sur notre site web</li>
        <li><strong>Réservation WhatsApp :</strong> Contactez-nous au +212 662 500 181</li>
        <li><strong>Confirmation :</strong> Recevez votre confirmation avec tous les détails</li>
        <li><strong>Récupération :</strong> Retrouvez-nous à l'aéroport à votre arrivée</li>
      </ol>

      <h2>Documents Requis</h2>
      <p>Pour récupérer votre véhicule, vous devez présenter :</p>
      <ul>
        <li>Permis de conduire international ou européen</li>
        <li>Pièce d'identité (passeport ou carte d'identité)</li>
        <li>Carte de crédit pour la caution</li>
        <li>Confirmation de réservation</li>
      </ul>

      <h2>Nos Services à l'Aéroport</h2>
      <p>AmseelCars vous propose des services premium directement à l'aéroport :</p>
      <ul>
        <li><strong>Accueil personnalisé :</strong> Notre équipe vous attend avec votre véhicule</li>
        <li><strong>Assistance bagages :</strong> Aide au chargement de vos valises</li>
        <li><strong>Briefing complet :</strong> Explication du véhicule et des routes</li>
        <li><strong>Support 24/7 :</strong> Assistance disponible à tout moment</li>
      </ul>

      <h2>Conseils Pratiques</h2>
      <p>Pour une expérience optimale, nous vous recommandons de :</p>
      <ul>
        <li>Réserver à l'avance, surtout en haute saison</li>
        <li>Vérifier les conditions de circulation avant votre départ</li>
        <li>Prévoir un budget pour l'essence et les péages</li>
        <li>Garder nos coordonnées à portée de main</li>
      </ul>

      <h2>Contact et Réservation</h2>
      <p>Prêt à réserver votre voiture de location à l'aéroport d'Agadir ? Contactez AmseelCars dès maintenant :</p>
      <ul>
        <li><strong>WhatsApp :</strong> +212 662 500 181</li>
        <li><strong>Email :</strong> info@amseelcars.com</li>
        <li><strong>Site web :</strong> www.amseelcars.com</li>
      </ul>
    `,
    category: "Guide Pratique",
    readTime: "5 min",
    date: "15 Jan 2025",
    publishedAt: "2025-01-15T10:00:00Z",
    image: "/images/blog/airport-guide.jpg",
    featured: true,
    tags: ["location", "aéroport", "agadir", "guide", "réservation"],
    author: {
      name: "Équipe AmseelCars",
      avatar: "/images/team/amseel-team.jpg",
      bio: "Experts en location de voitures premium à Agadir"
    },
    seo: {
      metaTitle: "Guide Location Voiture Aéroport Agadir - AmseelCars",
      metaDescription: "Guide complet pour louer une voiture à l'aéroport d'Agadir. Réservation, documents, conseils pratiques. Service premium AmseelCars.",
      keywords: ["location voiture aéroport agadir", "louer voiture agadir", "location voiture maroc", "aéroport agadir location"],
      canonical: "/blog/guide-location-voiture-aeroport-agadir"
    }
  },
  {
    id: 2,
    slug: "meilleures-routes-explorer-depuis-agadir",
    title: "Les Meilleures Routes à Explorer depuis Agadir",
    excerpt: "Découvrez les plus beaux itinéraires de road trip au départ d'Agadir, des montagnes de l'Atlas aux plages du sud.",
    content: `
      <h2>Introduction aux Routes d'Agadir</h2>
      <p>Agadir, porte d'entrée du sud marocain, offre un point de départ idéal pour explorer les merveilles du Maroc. De la côte atlantique aux montagnes de l'Atlas, chaque route révèle des paysages uniques.</p>

      <h2>Route Côtière : Agadir - Essaouira</h2>
      <p>Cette route de 200km longe la côte atlantique et offre des vues spectaculaires sur l'océan.</p>
      <ul>
        <li><strong>Distance :</strong> 200km</li>
        <li><strong>Durée :</strong> 3h30</li>
        <li><strong>Points d'intérêt :</strong> Plages sauvages, villages de pêcheurs</li>
      </ul>

      <h2>Route des Montagnes : Agadir - Taroudant</h2>
      <p>Direction l'intérieur des terres vers Taroudant, la "Petite Marrakech".</p>
      <ul>
        <li><strong>Distance :</strong> 80km</li>
        <li><strong>Durée :</strong> 1h30</li>
        <li><strong>Points d'intérêt :</strong> Palmeraies, architecture berbère</li>
      </ul>

      <h2>Route du Sud : Agadir - Tiznit</h2>
      <p>Explorez le sud marocain et ses traditions authentiques.</p>
      <ul>
        <li><strong>Distance :</strong> 100km</li>
        <li><strong>Durée :</strong> 2h</li>
        <li><strong>Points d'intérêt :</strong> Souks traditionnels, artisanat local</li>
      </ul>
    `,
    category: "Voyage",
    readTime: "7 min",
    date: "12 Jan 2025",
    publishedAt: "2025-01-12T14:30:00Z",
    image: "/images/blog/road-trips.jpg",
    featured: false,
    tags: ["road trip", "routes", "voyage", "agadir", "exploration"],
    author: {
      name: "Équipe AmseelCars",
      avatar: "/images/team/amseel-team.jpg",
      bio: "Experts en location de voitures premium à Agadir"
    },
    seo: {
      metaTitle: "Meilleures Routes Road Trip depuis Agadir - AmseelCars",
      metaDescription: "Découvrez les plus belles routes à explorer depuis Agadir. Itinéraires road trip, conseils pratiques, locations de voitures.",
      keywords: ["road trip agadir", "routes maroc", "itinéraires agadir", "voyage maroc"],
      canonical: "/blog/meilleures-routes-explorer-depuis-agadir"
    }
  },
  {
    id: 3,
    slug: "assurance-auto-location-voiture",
    title: "Assurance Auto: Ce qu'il Faut Savoir",
    excerpt: "Comprendre les différents types d'assurance pour votre location de voiture et choisir la protection adaptée à vos besoins.",
    content: `
      <h2>Types d'Assurance en Location</h2>
      <p>L'assurance est un élément crucial lors de la location d'une voiture. Chez AmseelCars, nous vous proposons plusieurs niveaux de protection.</p>

      <h3>Assurance de Base</h3>
      <p>Incluse dans tous nos forfaits, elle couvre :</p>
      <ul>
        <li>Responsabilité civile</li>
        <li>Protection du véhicule contre le vol</li>
        <li>Assistance 24h/24</li>
      </ul>

      <h3>Assurance Complète</h3>
      <p>Pour une tranquillité maximale :</p>
      <ul>
        <li>Franchise réduite</li>
        <li>Protection tous risques</li>
        <li>Remboursement en cas d'annulation</li>
      </ul>
    `,
    category: "Conseils",
    readTime: "4 min",
    date: "10 Jan 2025",
    publishedAt: "2025-01-10T09:15:00Z",
    image: "/images/blog/insurance.jpg",
    featured: false,
    tags: ["assurance", "location", "protection", "conseils"],
    author: {
      name: "Équipe AmseelCars",
      avatar: "/images/team/amseel-team.jpg",
      bio: "Experts en location de voitures premium à Agadir"
    },
    seo: {
      metaTitle: "Assurance Location Voiture Agadir - Guide Complet",
      metaDescription: "Guide complet sur l'assurance en location de voiture à Agadir. Types d'assurance, conseils, protection optimale.",
      keywords: ["assurance location voiture", "protection location", "assurance agadir"],
      canonical: "/blog/assurance-auto-location-voiture"
    }
  }
];

// Utility functions
export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(article => article.slug === slug);
}

export function getAllArticles(): BlogArticle[] {
  return blogArticles;
}

export function getFeaturedArticles(): BlogArticle[] {
  return blogArticles.filter(article => article.featured);
}

export function getArticlesByCategory(category: string): BlogArticle[] {
  return blogArticles.filter(article => article.category === category);
}

export function getRelatedArticles(currentSlug: string, limit: number = 3): BlogArticle[] {
  const currentArticle = getArticleBySlug(currentSlug);
  if (!currentArticle) return [];

  return blogArticles
    .filter(article => 
      article.slug !== currentSlug && 
      (article.category === currentArticle.category || 
       article.tags.some(tag => currentArticle.tags.includes(tag)))
    )
    .slice(0, limit);
}

