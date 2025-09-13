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
      title: "Business Car Rental",
      description: "Premium, reliable vehicles and flexible terms tailored for teams, events, and executive travel.",
      src: "img-3.webp",
      link: "images/rock.jpg",
      color: "#BBACAF"
    },
    {
      title: "Door-to-Door Delivery & Pickup",
      description: "We bring the car to you—hotel, airport, office, or home—and collect it when you’re done.",
      src: "bmwx3.webp",
      link: "images/bmwx3.webp",
      color: "#ac998b"
    },
    {
      title: "Wide Range of Cars",
      description: "From compact city cars to SUVs and luxury models, choose the perfect ride for any trip.",
      src: "Touareg auto diesel 2025 blanche.webp",
      link: "images/water.jpg",
      color: "#e16133"
    },
    {
      title: "Flexible Drop-Off Anywhere",
      description: "Return your car at a different location—our team will retrieve it and handle the rest.",
      src: "img-4.webp",
      link: "images/house.jpg",
      color: "#d7373c"
    },
    {
      title: "Exceptional Customer Service",
      description: "Our friendly, 24/7 support team is here to help you at every step—from reservation to return.",
      src: "img-5.webp",
      link: "images/cactus.jpg",
      color: "#a4b7a8"
    }
  ]