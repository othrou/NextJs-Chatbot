import { db } from '@/lib/db';
import { medicaments } from '@/lib/db/schema/medicament';
import { tool } from 'ai';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

// Cet outil permet à l'IA de générer et d'exécuter des requêtes SQL
// directement sur notre base de données de médicaments.

export const queryDatabaseTool = tool({
  description: `Exécute une requête SQL sur la base de données des médicaments et retourne le résultat.
  Utilise cet outil pour répondre aux questions concernant les données structurées des médicaments :
  - Nom commercial
  - DCI (Dénomination Commune Internationale)
  - Similarité avec la base française
  - Score de similarité
  - Pays fournisseur
  - Statut d'autorisation

  Le schéma de la table est le suivant :
  Table "medicaments":
  - id (integer, clé primaire)
  - nom_commercial_ci (text)
  - dci (text)
  - similarite_base_francaise (text)
  - score_similarite (varchar)
  - pays_fournisseur (text)
  - statut_autorisation (text)

  Exemples de questions :
  - "Quel est le statut d'autorisation pour le médicament XYZ ?"
  - "Donne-moi tous les médicaments fournis par l'Inde."
  - "Quel est le DCI de KOMBOGLYZE ?"
  `,
  inputSchema: z.object({
    query: z.string().describe("La requête SQL à exécuter. Doit être une requête SELECT valide pour PostgreSQL."),
  }),
  execute: async ({ query }) => {
    try {
      console.log(`Exécution de la requête SQL générée par l'IA : ${query}`);
      // On exécute la requête directement. C'est une approche simple.
      // Pour une application en production, il faudrait valider et sécuriser la requête
      // pour éviter les injections SQL.
      const result = await db.execute(sql.raw(query));
      console.log("Résultat de la requête :", result);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête SQL :", error);
      // On informe l'IA que sa requête a échoué.
      return { error: `Erreur d'exécution: ${(error as Error).message}` };
    }
  },
});
