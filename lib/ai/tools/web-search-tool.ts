import { tool } from 'ai';
import { z } from 'zod';
import 'dotenv/config';

// Outil de recherche web qui appelle une API externe (Serper)
// pour obtenir des résultats de recherche fiables.
export const webSearchTool = tool({
  description: 'Effectue une recherche sur le web pour trouver des informations à jour ou externes.',
  inputSchema: z.object({
    query: z.string().describe('La requête de recherche à envoyer sur le web.'),
  }),
  execute: async ({ query }) => {
    // Vérification de la clé API
    if (!process.env.SERPER_API_KEY) {
      // Retourne un message d'erreur clair si la clé est manquante
      return { error: 'La clé API pour la recherche web (SERPER_API_KEY) est manquante dans le fichier .env.' };
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });

      if (!response.ok) {
        return { error: `Erreur de l'API de recherche: ${response.statusText}` };
      }

      const data = await response.json();
      
      // On ne retourne que les 3 premiers résultats organiques pour rester concis.
      const snippets = data.organic?.slice(0, 3).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      })) || [];
      
      if (snippets.length === 0) {
        return { results: "Aucun résultat trouvé sur le web pour cette requête." };
      }

      return { results: snippets };

    } catch (error) {
      console.error('Erreur lors de la recherche web:', error);
      return { error: 'Une erreur est survenue lors de la recherche web.' };
    }
  },
});

    

