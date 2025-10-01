import { serial, text, varchar, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Ce fichier définit la structure de notre table "medicaments" dans la base de données.
// Drizzle ORM utilisera ce schéma pour générer les requêtes SQL de migration et pour
// interagir avec la base de données de manière typée et sécurisée.

export const medicaments = pgTable("medicaments", {
  // Un identifiant unique auto-incrémenté pour chaque médicament.
  id: serial("id").primaryKey(),

  // Nom commercial du médicament en Côte d'Ivoire.
  nomCommercialCI: text("nom_commercial_ci"),

  // Dénomination Commune Internationale (le nom de la molécule).
  dci: text("dci"),

  // Le nom du médicament similaire dans la base de données française.
  similariteBaseFrancaise: text("similarite_base_francaise"),

  // Le score de similarité en pourcentage.
  scoreSimilarite: varchar("score_similarite"),

  // Le pays d'origine du fournisseur.
  paysFournisseur: text("pays_fournisseur"),

  // Le statut d'autorisation du médicament.
  statutAutorisation: text("statut_autorisation"),
});

// Schéma de validation pour l'insertion de nouveaux médicaments.
// Utile pour valider les données avant de les envoyer à la base.
export const insertMedicamentSchema = createSelectSchema(medicaments).omit({
  id: true,
});

// Type TypeScript dérivé du schéma pour une utilisation facile dans notre code.
export type NewMedicamentParams = z.infer<typeof insertMedicamentSchema>;
