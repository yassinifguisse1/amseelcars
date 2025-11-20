import styles from "./BlogArticles.module.scss";

export function BlogArticlesSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-8" />
        
        {/* Category filter skeleton */}
        <div className={styles.categoryFilter}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Featured article skeleton */}
      <div className={styles.featured}>
        <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
      </div>

      {/* Articles grid skeleton */}
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4">
            <div className="bg-gray-200 rounded-lg h-48 animate-pulse" />
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

