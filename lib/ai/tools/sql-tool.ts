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

Voici un exemple de ligne de la table "medicaments" :

\'id : 3, nom_commercial_ci : ALGIC 200MG/325MG/30MG COMPRIME BOITE DE 10, dci : IBUPROFENE+PARACETAMOL+CAFEINE, similarite_base_francaise : IPRAFEINE 400 mg/100 mg, comprimé pelliculé§§§IPRAFEINE 400 mg/100 mg, score_similarite : 84,	pays_fournisseur : ROYAUME UNI, statut_autorisation:Non autorisée'\


Exemples de questions que l'utilisateur pourrait poser :
- "Quel est le statut d'autorisation pour le médicament XYZ ?"
- "Donne-moi tous les médicaments fournis par l'Inde."
- "Quel est le DCI de KOMBOGLYZE ?"
- "Liste les médicaments ayant le DCI 'Paracétamol'.", dans ce cas, la requête doit utiliser l'opérateur ILIKE pour une recherche insensible à la casse : 'SELECT nom_commercial_ci FROM medicaments WHERE dci ILIKE '%Paracétamol%';'

**Notes importantes :**
- **Requêtes uniquement de type SELECT** sont autorisées.
- Utilisez l'opérateur (ILIKE) pour les champs textuels comme les noms de médicaments et d'autres chaînes de caractères. Par exemple : UPPER(nom_commercial_ci) ILIKE UPPER('%search_term%').
- Lorsque vous interrogez des champs comme (score_similarite), qui peuvent avoir des valeurs numériques ou textuelles, assurez-vous que les données soient bien extraites sous un format exploitable pour la visualisation.
- Lorsque vous interrogez des données temporelles, assurez-vous de renvoyer les résultats par année si cela est applicable. Par exemple, "Évolution du score de similarité au fil des années".

Quelques exemples de données disponibles :
- **Nom commercial**: Nom du médicament tel qu'il est commercialisé.
- **DCI (Dénomination Commune Internationale)**: Le nom international du médicament.
- **Similarité avec la base française**: La similarité par rapport à une base de données française.
- **Score de similarité**: Un score mesurant la similarité entre le médicament et d'autres médicaments dans la base.
- **Pays fournisseur**: Le pays qui fournit le médicament.
- **Statut d'autorisation**: Le statut réglementaire du médicament (par exemple, approuvé, en attente).

** important: **

Les résultats de ces requêtes seront exploités par un agent spécialiste pour des actions ou analyses supplémentaires dans le cadre de leur expertise sur la base de données ivoirienne.`,
  
  inputSchema: z.object({
    query: z.string().describe("La requête SQL à exécuter. Elle doit être une requête SELECT valide pour PostgreSQL."),
  }),
  
  execute: async ({ query }) => {
    try {
      console.log(`Exécution de la requête SQL générée par l'IA : ${query}`);
      // Exécute la requête directement, une approche simple mais à valider et sécuriser dans un cadre de production pour éviter les injections SQL.
      const result = await db.execute(sql.raw(query));
      console.log("Résultat de la requête :", result);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'exécution de la requête SQL :", error);
      // Retourne l'erreur à l'IA
      return { error: `Erreur d'exécution: ${(error as Error).message}` };
    }
  },
});
