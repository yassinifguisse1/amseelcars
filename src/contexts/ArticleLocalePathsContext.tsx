"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { ArticleLocalePaths } from "@/lib/blog/article-locale-paths";

interface ArticleLocalePathsContextValue {
  paths: ArticleLocalePaths | null;
  setPaths: Dispatch<SetStateAction<ArticleLocalePaths | null>>;
}

const ArticleLocalePathsContext = createContext<ArticleLocalePathsContextValue | null>(null);

export function ArticleLocalePathsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [paths, setPaths] = useState<ArticleLocalePaths | null>(null);
  const value = useMemo(() => ({ paths, setPaths }), [paths]);

  return (
    <ArticleLocalePathsContext.Provider value={value}>
      {children}
    </ArticleLocalePathsContext.Provider>
  );
}

export function ArticleLocalePathsSync({ paths }: { paths: ArticleLocalePaths }) {
  const context = useContext(ArticleLocalePathsContext);
  const setPaths = context?.setPaths;

  useEffect(() => {
    if (!setPaths) return;
    setPaths(paths);
    return () => setPaths(null);
  }, [paths, setPaths]);

  return null;
}

export function useArticleLocalePaths() {
  return useContext(ArticleLocalePathsContext)?.paths ?? null;
}
