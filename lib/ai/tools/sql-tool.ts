import { db } from '@/lib/db';
import { Output, tool } from 'ai';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

export const queryDatabaseTool = tool({
  description: `Interroge la base de données PostgreSQL des médicaments disponibles en Côte d'Ivoire.

**Structure de la table "medicaments" :**
- id (integer, clé primaire)
- nom_commercial_ci (text) - Nom commercial du médicament
- dci (text) - Dénomination Commune Internationale (peut contenir plusieurs principes actifs séparés par '+')
- similarite_base_francaise (text)
- score_similarite (varchar)
- pays_fournisseur (text) - Pays d'origine
- statut_autorisation (text) - Statut réglementaire

**Cas d'usage :**
✅ Rechercher un médicament par nom commercial ou DCI
✅ Lister les médicaments contenant un principe actif spécifique
✅ Obtenir le pays fournisseur et le statut d'autorisation
✅ Compter les médicaments répondant à des critères
✅ Vérifier l'existence d'un médicament dans la base

**IMPORTANT : Recherche de médicaments**
- Pour trouver "Doliprane", utilise : WHERE unaccent(LOWER(nom_commercial_ci)) ILIKE '%doliprane%' AND unaccent(LOWER(nom_commercial_ci)) NOT ILIKE '%codo% limit 2;'
- Cela évite de confondre Doliprane avec Codoliprane
- Si besoin de médicaments similaires, fais une requête séparée

**Règles SQL OBLIGATOIRES :**
- UNIQUEMENT des requêtes SELECT (lecture seule)
- Pour rechercher du texte, TOUJOURS utiliser : unaccent(LOWER(colonne)) ILIKE '%motcle% limit 2;'
- Ne jamais utiliser LIKE seul (insensible aux accents requis)

**Exemples de requêtes valides :**
- Recherche par DCI : SELECT * FROM medicaments WHERE unaccent(LOWER(dci)) ILIKE '%paracetamol%' LIMIT 2;
- Recherche par nom : SELECT * FROM medicaments WHERE unaccent(LOWER(nom_commercial_ci)) ILIKE '%doliprane%' LIMIT 2;
- Comptage : SELECT COUNT(*) FROM medicaments WHERE unaccent(LOWER(dci)) ILIKE '%ibuprofene%';
- Médicaments d'un pays : SELECT nom_commercial_ci, dci FROM medicaments WHERE unaccent(LOWER(pays_fournisseur)) ILIKE '%france%' LIMIT 2;`,
  
  inputSchema: z.object({
    query: z.string().describe("Requête SQL SELECT valide pour PostgreSQL avec unaccent et ILIKE pour les recherches textuelles"),
  }),
  
  execute: async ({ query }) => {
    try {
      // Validation basique de sécurité
      const normalizedQuery = query.trim().toUpperCase();
      if (!normalizedQuery.startsWith('SELECT')) {
        return { error: "Seules les requêtes SELECT sont autorisées" };
      }
      
      if (normalizedQuery.includes('DROP') || 
          normalizedQuery.includes('DELETE') || 
          normalizedQuery.includes('UPDATE') ||
          normalizedQuery.includes('INSERT')) {
        return { error: "Requête interdite : seules les lectures sont autorisées" };
      }
      
      console.log(`[SQL QUERY] Executing: ${query}`);
      
      const result = await db.execute(sql.raw(query));
      
      console.log(`[SQL QUERY] Returned ${result.length || 0} rows`);
      
      if (!result || result.length === 0) {
        return "Aucun résultat trouvé dans la base de données pour cette requête.";
      }
      
      const output = JSON.stringify(result, null, 2)
      console.log(`[SQL tool] Returned this results :  ${output}`);
      return output;
      
    } catch (error) {
      console.error("[SQL QUERY] Error:", error);
      return { 
        error: `Erreur SQL : ${(error as Error).message}`,
        suggestion: "Vérifie la syntaxe et utilise unaccent(LOWER(colonne)) ILIKE '%terme%' pour les recherches textuelles"
      };
    }
  }
});