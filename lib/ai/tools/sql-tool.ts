import { db } from '@/lib/db';
import { medicaments } from '@/lib/db/schema/medicament';
import { tool } from 'ai';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

// Cet outil permet à l'IA de générer et d'exécuter des requêtes SQL
// directement sur notre base de données des médicaments.

export const queryDatabaseTool = tool({
  description: `Vous êtes un expert en SQL (PostgreSQL). Votre rôle est d'aider l'utilisateur à écrire une requête SQL pour récupérer les données dont il a besoin, en vous basant sur la structure de la table suivante :

Table "medicaments" :
  - id (integer, clé primaire)
  - nom_commercial_ci (text)
  - dci (text)
  - similarite_base_francaise (text)
  - score_similarite (varchar)
  - pays_fournisseur (text)
  - statut_autorisation (text)

Exemples de questions que l'utilisateur pourrait poser :

- "Liste les médicaments ayant le DCI 'Paracétamol'.", dans ce cas, la requête doit utiliser l'opérateur ILIKE pour une recherche insensible à la casse : 'SELECT nom_commercial_ci FROM medicaments WHERE unaccent(LOWER(dci)) ILIKE '%Paracétamol%';'

**Notes importantes :**
- **Requêtes uniquement de type SELECT** sont autorisées.
- les requetes de recherche de texte doivent nécessairement utiliser : unaccent(LOWER(dci)) LIKE '%motcle%'.
- Pour rechercher un DCI spécifique, utilisez la fonction (unaccent(LOWER(dci)) LIKE '%motcle%') pour une recherche insensible aux accents et à la casse.

Quelques exemples de données disponibles :
- **Nom commercial**: Nom du médicament tel qu'il est commercialisé.
- **DCI (Dénomination Commune Internationale)**: Peut contenir un ou plusieurs principes actifs séparés par '+' (ex: 'IBUPROFENE+PARACETAMOL+CAFEINE').
- **Similarité avec la base française**: La similarité par rapport à une base de données française.
- **Score de similarité**: Un score mesurant la similarité entre le médicament et d'autres médicaments dans la base.
- **Pays fournisseur**: Le pays qui fournit le médicament.
- **Statut d'autorisation**: Le statut réglementaire du médicament (par exemple, approuvé, en attente).

** important: **
- utilise toujours en cas de recherche des requetes de la forme : unaccent(LOWER(dci)) ILIKE '%motcle%' ou unaccent(LOWER(nom_commercial_ci)) ILIKE '%motcle%'.
`,
  
  inputSchema: z.object({
    query: z.string().describe("La requête SQL à exécuter. Elle doit être une requête SELECT valide pour PostgreSQL."),
  }),
  
  execute: async ({ query }) => {
      try {
      console.log(`Exécution de la requête SQL générée par l'IA : ${query}`);
      const result = await db.execute(sql.raw(query));
      console.log("Résultat de la requête :", result);
      // Convertir le résultat en une chaîne JSON pour que le modèle puisse le traiter plus facilement.
      return JSON.stringify(result);
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête SQL :", error);
      // Retourne l'erreur à l'IA
      return { error: `Erreur d'exécution: ${(error as Error).message}` };
    }}

  })
  









