import Link from "next/link";

/** Routes outside `app/[locale]/` (e.g. sign-in, admin) use this file. */
export default function GlobalNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Cette page n’existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="text-primary underline underline-offset-4"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
