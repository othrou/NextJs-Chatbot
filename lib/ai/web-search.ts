import { tavily } from '@tavily/core';

// Initialisation du client Tavily
export const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

/**
 * Exécute une recherche web ciblée en utilisant la requête de l'utilisateur.
 * @param query La question de l'utilisateur.
 * @returns Une promesse qui se résout avec les résultats de la recherche ou null en cas d'erreur.
 */
export async function performWebSearch(query: string) {
  try {
    console.log(`Exécution de la recherche web pour : "${query}"`);
    const response = await tavilyClient.search(query, {
        // On cible des domaines pertinents pour augmenter la qualité des résultats
        includeDomains: ["recomedicales.fr", "vidal.fr", "ansm.sante.fr", "has-sante.fr", "www.sfpt-fr.org"],
    });

    console.log("Résultats de la recherche web:", response.results);
    
    // On retourne uniquement les informations qui nous intéressent
    return response.results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche web :", error);
    return null; // On retourne null pour gérer l'erreur gracieusement
  }
}
