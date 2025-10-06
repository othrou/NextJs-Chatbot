import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

// Import de nos outils personnalisés
import { queryDatabaseTool } from '@/lib/ai/tools/sql-tool';
import { searchDocumentsTool } from '@/lib/ai/tools/vector-search-tool';
import { webSearchTool } from '@/lib/ai/tools/web-search-tool'; 
import { SYSTEM_PROMPT } from './system-prompt';


export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    // Le modèle est fixe et défini ici.
    model: google('models/gemini-2.0-flash'),
    
    // Le system prompt est ajusté pour indiquer que tous les outils sont toujours disponibles.

    system: SYSTEM_PROMPT ,

    // Tous les outils sont maintenant disponibles en permanence pour l'IA.
    tools: {
      webSearchTool,
      searchDocumentsTool,
      queryDatabaseTool,
    },
    
    messages: convertToModelMessages(messages),
  });

  const sources = await result.sources;
    for (const source of sources) {
    if (source.sourceType === 'url') {
        console.log('ID:', source.id);
        console.log('Title:', source.title);
        console.log('URL:', source.url);
        console.log('Provider metadata:', source.providerMetadata);
        console.log();
    }
    }

  // La réponse est streamée vers le client.
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}


