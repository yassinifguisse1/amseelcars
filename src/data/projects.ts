// Visual assets for the cars page parallax stack (titles/descriptions: messages → parallaxProjects.items)
export interface Project {
  title: string;
  description: string;
  src: string;
  link: string;
  color: string;
}

export const parallaxProjectAssets: Omit<Project, "title" | "description">[] = [
  {
    src: "img-3.webp",
    link: "images/rock.jpg",
    color: "#BBACAF",
  },
  {
    src: "livraison-recuperation.webp",
    link: "images/bmwx3.webp",
    color: "#ac998b",
  },
  {
    src: "large-gamme-de-voitures.webp",
    link: "images/water.jpg",
    color: "#e16133",
  },
  {
    src: "Retour-Flexible-Partout.webp",
    link: "images/house.jpg",
    color: "#d7373c",
  },
  {
    src: "Service Client Exceptionnel.webp",
    link: "images/cactus.jpg",
    color: "#a4b7a8",
  },
];
