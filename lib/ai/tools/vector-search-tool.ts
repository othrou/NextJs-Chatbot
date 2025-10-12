import { findRelevantContent } from '@/lib/ai/embedding';
import { tool } from 'ai';
import { z } from 'zod';

// Cet outil est une version améliorée de la recherche par similarité que nous avions déjà.
// Il permet à l'IA de chercher des informations dans le contenu des fichiers PDF.

export const searchDocumentsTool = tool({
    description: `Recherche des informations pertinentes dans les documents internes (fiches techniques, recommandations PDF) pour répondre à une question.
    Utilise cet outil pour les questions sur :
    - La posologie
    - Les indications thérapeutiques
    - Les effets secondaires
    - Le mode d'administration
    - La classe thérapeutique
    - Les protocoles décrits dans les documents de référence.
    `,
    inputSchema: z.object({
        question: z.string().describe("La question de l'utilisateur pour trouver les documents pertinents."),
    }),
    execute: async ({ question }) => {
        try {
            console.log(`Recherche dans les documents pour la question : "${question}"`);
            const relevantContent = await findRelevantContent(question);
            console.log("Contenu pertinent trouvé :", relevantContent);
            if (relevantContent.length > 0) {
                // On convertit le résultat en JSON pour une meilleure interprétation par le modèle.
                return JSON.stringify(relevantContent);
            }
            return "Aucune information pertinente n'a été trouvée dans les documents internes pour cette question.";
        } catch (error) {
            console.error("Erreur lors de la recherche dans les documents :", error);
            return { error: `Erreur de recherche: ${(error as Error).message}` };
        }
    }
});
