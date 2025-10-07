import { tool } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';

export const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });


export const webSearchTool = tool({
  description: `Cherche sur le web des informations médicales et pharmacologiques à jour. 
  Cet outil est particulièrement utile pour trouver des informations sur la classe thérapeutique, les indications médicales, la posologie, et les recommandations de sociétés savantes.
  La recherche est optimisée pour des sources francophones fiables.`,
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe('La question ou le terme de recherche.')
  }),
  execute: async ({query}) => {
    // On enrichit la recherche pour prioriser les sites de confiance
    const enhancedQuery = `${query} site:recomedicales.fr OR site:vidal.fr OR site:ansm.sante.fr OR site:has-sante.fr`;
    
    console.log(`Executing web search with enhanced query: "${enhancedQuery}"`);
    
    try {
      const response = await tavilyClient.search(enhancedQuery, {
        maxResults: 5, // On se concentre sur les meilleurs résultats
      });
      
      console.log("Web search results:", response.results);
      
      return response.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content,
      }));

    } catch (error) {
      console.error("Tavily search failed:", error);
      return `La recherche web a échoué : ${(error as Error).message}`;
    }
  },
});
