// lib/mongodb.ts
import { MongoClient } from "mongodb";

// Next.js dev mode runs modules multiple times -> cache client globally
let cachedClient: MongoClient | null = null;
let cachedUri: string | null = null;

function getMongoConfig() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  const dbName =
    process.env.MONGODB_DB ??
    process.env.MONGO_DB ??
    process.env.MONGODB_DATABASE;

  if (!uri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URI in .env.local."
    );
  }

  return { uri, dbName };
}

export async function getDb() {
  const { uri, dbName } = getMongoConfig();

  if (!cachedClient || cachedUri !== uri) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
    cachedUri = uri;
  }

  return dbName ? cachedClient.db(dbName) : cachedClient.db();
}
