import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

// Import de nos outils personnalisés
import { queryDatabaseTool } from '@/lib/ai/tools/sql-tool';
import { searchDocumentsTool } from '@/lib/ai/tools/vector-search-tool';

export const maxDuration = 30;

export async function POST(req: Request) {
  // On ne récupère que les messages, car il n'y a pas de sélection de modèle ou de websearch côté client.
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Le modèle est fixe et défini ici.
    model: google('models/gemini-2.0-flash-lite'),
    
    // Le system prompt est ajusté pour indiquer que tous les outils sont toujours disponibles.
    system: `Tu es un assistant expert en pharmacologie, spécialisé dans les médicaments disponibles en Côte d'Ivoire.
    Ta mission est de fournir des réponses structurées, précises et sourcées aux questions des professionnels de santé.

    Pour chaque question sur un médicament, tu dois systématiquement utiliser tes outils dans cet ordre :
    1.  **Identifier le médicament** et ses informations de base (DCI, statut...) en utilisant l'outil \`queryDatabaseTool\`. C'est la première étape OBLIGATOIRE.
    2.  **Chercher les informations cliniques** (posologie, indications...) dans les documents internes avec l'outil \`searchDocumentsTool\`.
    3.  **Compléter avec des informations récentes** ou externes en utilisant ton outil de recherche web \`Google Search\`.
    4.  **Synthétiser toutes les informations** collectées dans une fiche structurée et complète.

    Règles de réponse :
    - Réponse en markdown
    - Ne réponds JAMAIS sans avoir utilisé au moins l'outil \`queryDatabaseTool\`.
    - Cite TOUJOURS tes sources.
    - Si une information n'est pas trouvée, indique-le clairement.
    - Le format de la réponse finale DOIT être une fiche structurée en Markdown.
    `,

    // Tous les outils sont maintenant disponibles en permanence pour l'IA.
    tools: {
      queryDatabaseTool,
      searchDocumentsTool,
      google_search: google.tools.googleSearch({}),
    },
    messages: convertToModelMessages(messages),
  });

  // La réponse est streamée vers le client.
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}

