import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { queryDatabaseTool } from '@/lib/ai/tools/sql-tool';
import { performWebSearch } from '@/lib/ai/web-search'; 
import { findRelevantContent } from '@/lib/ai/embedding';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Extraire la dernière question utilisateur
  const lastUserMessage = messages[messages.length - 1];
  const textPart = lastUserMessage.parts.find(part => part.type === 'text');
  const userQuery = textPart ? textPart.text : '';
  
  let documentContext = "";
  let webContext = "";
  let webSources = "";

  if (userQuery && userQuery.trim().length > 0) {
    // 1. Recherche dans les documents vectorisés
    try {
      console.log(`[Embedding] Recherche pour : "${userQuery}"`);
      const relevantContent = await findRelevantContent(userQuery);
      if (relevantContent && relevantContent.length > 0) {
        documentContext = "\n\n**📄 DOCUMENTS PERTINENTS DISPONIBLES :**\n" + 
                          relevantContent.map((item, i) => 
                            `${i + 1}. ${item.name}\n${'content' in item && typeof item.content === 'string' ? item.content.substring(0, 500) + '...' : '(Pas de contenu disponible)'}`
                          ).join('\n\n');
        console.log(`[Embedding] ${relevantContent.length} document(s) trouvé(s)`);
      }
    } catch (error) {
      console.error("[Embedding] Erreur :", error);
    }

    // 2. Recherche web si nécessaire
    try {
      console.log(`[Web Search] Recherche pour : "${userQuery}"`);
      const searchResults = await performWebSearch(userQuery);
      if (searchResults && searchResults.length > 0) {
        webContext = "\n\n**🌐 INFORMATIONS WEB RÉCENTES :**\n" +
                     searchResults.map((res, i) => 
                       `${i + 1}. **${res.title}**\n${res.content?.substring(0, 400)}...\n`
                     ).join('\n');
        webSources = searchResults.map(res => `- [${res.title}](${res.url})`).join('\n');
        console.log(`[Web Search] ${searchResults.length} résultat(s) trouvé(s)`);
      }
    } catch (error) {
      console.error("[Web Search] Erreur :", error);
    }
  }

  const SYSTEM_PROMPT = `Tu es un assistant expert en pharmacologie, spécialisé dans les médicaments disponibles en Côte d'Ivoire.

**CONTEXTE DISPONIBLE :**
${documentContext}
${webContext}

**TES OUTILS :**
- \`queryDatabaseTool\` : Pour interroger la base de données des médicaments (recherche par DCI, nom commercial, statistiques)

**QUAND UTILISER queryDatabaseTool :**
✅ Liste des médicaments contenant un DCI spécifique (ex: "médicaments avec paracétamol")
✅ Recherche par nom commercial (ex: "trouve Doliprane")
✅ Statistiques/comptages (ex: "combien de médicaments avec ibuprofène ?")
✅ Vérifier l'existence d'un médicament dans la base
✅ Donner le pays fournisseur ou le statut d'autorisation d'un médicament


❌ NE PAS utiliser pour : définitions générales, posologies standards, effets secondaires génériques

**FORMAT DE RÉPONSE à respecter obligatoirement :**
Réponds TOUJOURS en Markdown structuré :

## Nom commercial : [Nom]
### DCI : [Principe actif]

### Classe thérapeutique :
- [Classe principale]
- [Sous-classe si pertinente]

### Indications médicales :
- [Indication 1]
- [Indication 2]

### Posologie habituelle adulte :
- [Dose et fréquence]

### ⚠️ Précautions importantes :
- [Si pertinent]

### 📚 Sources :
${webSources || "- donne la source de données url et titres...)"}

**RÈGLES IMPORTANTES :**
1. Synthétise TOUTES les sources (documents + web + base de données)
2. Si la base de données ne retourne rien, utilise le contexte documentaire/web
3. Ne mentionne JAMAIS les outils utilisé (par exemple ne dis pas : selon l'outil..)
4. Cite toujours tes sources à la fin, tous les sources existant dans le contexte, en format liste
5. Si aucune info n'est disponible nulle part, dis-le clairement et donne des informations générales si tu les connais`;

  const result = streamText({
    model: google('models/gemini-2.0-flash-lite'),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: {
      queryDatabaseTool
    },
    
    toolChoice: 'auto',
     stopWhen: stepCountIs(5),
    onFinish: ({ usage, finishReason }) => {
      console.log('[Finish]', { usage, finishReason });
    },
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}