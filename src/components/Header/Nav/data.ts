export interface LinkData {
    title: string;
    href: string;
}

export const links: LinkData[] = [
    {
        title: "Accueil",
        href: "/"
    },
    {
        title: "À propos",
        href: "/about"
    },
    {
        title: "Voitures",
        href: "/cars"
    },
    {
        title: "Contactez-nous",
        href: "/contact"
    }
]

export const footerLinks: LinkData[] = [
    {
        title: "Facebook",
        href: "https://www.facebook.com/amseelcars/"
    },
    {
        title: "Instagram",
        href: "https://www.instagram.com/amseelcars/"
    }
]