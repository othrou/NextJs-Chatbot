import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config"; // Assure que les variables de .env sont chargées

if (!process.env.DATABASE_URL) {
  throw new Error("La variable d'environnement DATABASE_URL est manquante.");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
