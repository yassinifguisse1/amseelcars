import "dotenv/config";
import { MongoClient } from "mongodb";

function getDatabaseName(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const name = url.pathname.replace(/^\/+/, "");
    return name || "test";
  } catch {
    return "test";
  }
}

async function main() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is missing. Check your .env.local");
  }

  const dbName = getDatabaseName(uri);
  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("blog_articles");

  const localeResult = await collection.updateMany(
    {
      $or: [
        { locale: { $exists: false } },
        { locale: null },
        { locale: "" },
      ],
    },
    {
      $set: { locale: "fr" },
    },
  );

  const translationResult = await collection.updateMany(
    {
      $or: [
        { translationGroup: { $exists: false } },
        { translationGroup: null },
        { translationGroup: "" },
      ],
    },
    [
      {
        $set: {
          translationGroup: "$slug",
        },
      },
    ],
  );

  const total = await collection.countDocuments();
  const fr = await collection.countDocuments({ locale: "fr" });
  const en = await collection.countDocuments({ locale: "en" });

  console.log("Blog locale backfill complete:");
  console.log(
    JSON.stringify(
      {
        dbName,
        updatedLocale: localeResult.modifiedCount,
        updatedTranslationGroup: translationResult.modifiedCount,
        totals: { total, fr, en },
      },
      null,
      2,
    ),
  );

  await client.close();
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});

