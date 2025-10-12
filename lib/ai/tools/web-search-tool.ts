import { tool } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';

export const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

export const webSearchTool = tool({
  description: `Recherche sur le web des informations médicales à jour provenant de sources fiables (recomedicales.fr, vidal.fr, ansm.sante.fr, has-sante.fr).
  
Utilise cet outil pour compléter les informations non trouvées dans la base de données ou les documents internes, notamment :
- Classe thérapeutique détaillée
- Indications médicales récentes
- Posologie standard adulte
- Contre-indications et précautions
- Recommandations de sociétés savantes

Les résultats incluent le titre, l'URL et le contenu pertinent de chaque source.`,
  
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe('Terme de recherche médical (nom du médicament ou DCI)')
  }),
  
  execute: async ({query}) => {
    //const enhancedQuery = `${query} site:recomedicales.fr OR site:vidal.fr OR site:ansm.sante.fr OR site:has-sante.fr`;
    
    console.log(`[WEB SEARCH] Query: "${query}"`);
    
    try {

      const response = await tavilyClient.search(query, {
              // On cible des domaines pertinents pour augmenter la qualité des résultats
              includeDomains: ["recomedicales.fr", "vidal.fr", "ansm.sante.fr", "has-sante.fr", "www.sfpt-fr.org"],
          maxResults: 5,
          });
      
      console.log(`[WEB SEARCH] Found ${response.results.length} results`);
      
      if (response.results.length === 0) {
        return "Aucun résultat trouvé sur les sites médicaux de référence.";
      }
      
      return response.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
      }));

    } catch (error) {
      console.error("[WEB SEARCH] Error:", error);
      return `Erreur lors de la recherche web : ${(error as Error).message}`;
    }
  },
});