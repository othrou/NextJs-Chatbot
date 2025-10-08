import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { queryDatabaseTool } from '@/lib/ai/tools/sql-tool';
import { performWebSearch } from '@/lib/ai/web-search'; 
import { SYSTEM_PROMPT } from './system-prompt';
import { findRelevantContent } from '@/lib/ai/embedding'; // Import direct de la fonction

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 1. Exécuter la recherche vectorielle en amont, avant d'appeler l'agent.
  const lastUserMessage = messages[messages.length - 1];
  // Extraction correcte du contenu texte depuis le tableau 'parts'
  const textPart = lastUserMessage.parts.find(part => part.type === 'text');
  const userQuery = textPart ? textPart.text : '';
  
  let documentContext = "";
  // Vérifier si la requête utilisateur n'est pas vide avant de lancer la recherche.
  if (userQuery && userQuery.trim().length > 0) {
    try {
      console.log(`Recherche manuelle dans les documents pour la question : "${userQuery}"`);
      const relevantContent = await findRelevantContent(userQuery);
      if (relevantContent && relevantContent.length > 0) {
        // Formatter le contexte pour l'injecter dans le prompt système.
        documentContext = "--- Début du Contexte Documentaire Pertinent ---\n" + 
                          relevantContent.map(item => `Contenu: ${item.name}`).join('\n\n') +
                          "\n--- Fin du Contexte Documentaire Pertinent ---";
        console.log("Contexte documentaire ajouté au prompt.");
      } else {
        console.log("Aucun contexte documentaire trouvé.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche manuelle de documents :", error);
      // On continue même en cas d'erreur, mais sans le contexte des documents.
    }
  } else {
    console.log("Requête utilisateur vide, la recherche de documents est sautée.");
  }

  // recherche web
  let webContext = "";
  // Exécution de la recherche web si elle est activée
  if (userQuery && userQuery.trim().length > 0) {
    const searchResults = await performWebSearch(userQuery);
    if (searchResults && searchResults.length > 0) {
      webContext = "--- Début du Contexte de Recherche Web ---\n" +
                   searchResults.map(res => `Titre: ${res.title}\nURL: ${res.url}\nContenu: ${res.content}`).join('\n\n') +
                   "\n--- Fin du Contexte de Recherche Web ---";
      console.log("Contexte de recherche web ajouté au prompt.");
    } else {
      console.log("Aucun résultat de recherche web trouvé.");
    }
  }


  // 2. Préparer les outils restants et le modèle.
  const model = google('models/gemini-2.0-flash-lite');
  

  // 3. Injecter le contexte récupéré directement dans le prompt système.
  const systemPromptWithContext = `${SYSTEM_PROMPT}\n\n${documentContext}\n\n${webContext}`;

  // 4. Appeler le modèle avec le contexte enrichi et les outils restants.
  const result = streamText({
    model: model,
    system: systemPromptWithContext, // Utilisation du prompt enrichi
    tools: {
    queryDatabaseTool
  }, 
    stopWhen: stepCountIs(5), // Limite le nombre de tours pour éviter les boucles
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}







