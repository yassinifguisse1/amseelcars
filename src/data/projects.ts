// TypeScript interface for project data structure
export interface Project {
  title: string;
  description: string;
  src: string;
  link: string;
  color: string;
}

export const projects: Project[] = [
    {
      title: "Location de Voitures d'Affaires",
      description: "Véhicules haut de gamme, fiables et conditions flexibles adaptées aux équipes, événements et déplacements exécutifs.",
      src: "img-3.webp",
      link: "images/rock.jpg",
      color: "#BBACAF"
    },
    {
      title: "Livraison & Récupération à Domicile",
      description: "Nous amenons la voiture à vous—hôtel, aéroport, bureau ou domicile—et la récupérons à la fin de votre location.",
      src: "livraison-recuperation.webp",
      link: "images/bmwx3.webp",
      color: "#ac998b"
    },
    {
      title: "Large Gamme de Voitures",
      description: "Des citadines compactes aux SUV et modèles de luxe, choisissez le véhicule idéal pour chaque voyage.",
      src: "large-gamme-de-voitures.webp",
      link: "images/water.jpg",
      color: "#e16133"
    },
    {
      title: "Retour Flexible Partout",
      description: "Rendez votre voiture à un autre endroit—notre équipe viendra la récupérer et s’occupera du reste.",
      src: "Retour-Flexible-Partout.webp",
      link: "images/house.jpg",
      color: "#d7373c"
    },
    {
      title: "Service Client Exceptionnel",
      description: "Notre équipe sympathique, disponible 24h/24 et 7j/7, vous accompagne à chaque étape—de la réservation au retour.",
      src: "Service Client Exceptionnel.webp",
      link: "images/cactus.jpg",
      color: "#a4b7a8"
    }
  ]