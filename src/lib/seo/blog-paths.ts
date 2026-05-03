import type { Metadata } from "next";

const SITE_URL = "https://www.amseelcars.com";

type Alternates = NonNullable<Metadata["alternates"]>;

export function blogIndexPath() {
  return "/fr/blog";
}

export function blogCategoryPath(category: string) {
  return `/fr/blog/${category}`;
}

export function blogArticlePath(category: string, slug: string) {
  return `/fr/blog/${category}/${slug}`;
}

export function absoluteBlogUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function frenchBlogAlternates(path: string): Alternates {
  return {
    canonical: path,
    languages: {
      fr: path,
      "x-default": path,
    },
  };
}
