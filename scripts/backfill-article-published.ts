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

  const result = await collection.updateMany(
    {
      $or: [{ published: { $exists: false } }, { published: null }],
    },
    {
      $set: { published: true },
    },
  );

  const totals = {
    total: await collection.countDocuments(),
    published: await collection.countDocuments({ published: true }),
    drafts: await collection.countDocuments({ published: false }),
  };

  console.log("Blog article published backfill complete:");
  console.log(
    JSON.stringify(
      {
        dbName,
        updatedPublished: result.modifiedCount,
        totals,
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
