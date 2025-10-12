import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config"; // Assure que les variables de .env sont chargées

if (!process.env.DATABASE_URL) {
  throw new Error("La variable d'environnement DATABASE_URL est manquante.");
}
const client = postgres(process.env.DATABASE_URL, {
  // Augmentation du délai de connexion pour gérer les "cold starts" de la base de données
  connect_timeout: 20, 
});
export const db = drizzle(client);
