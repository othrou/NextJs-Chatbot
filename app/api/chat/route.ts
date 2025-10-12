import { streamText, UIMessage, convertToModelMessages, stepCountIs, validateUIMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { queryDatabaseTool } from '@/lib/ai/tools/sql-tool';
import { SYSTEM_PROMPT } from './system-prompt';
import { webSearchTool } from '@/lib/ai/tools/web-search-tool';
import { searchDocumentsTool } from '@/lib/ai/tools/vector-search-tool';
import { Experimental_Agent as Agent } from 'ai';

export const maxDuration = 30;

// API 1 : Pour vérifier que l'API fonctionne
export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: 'Bonjour, API fonctionne correctement' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// API 2 : C'est le coeur du système
export async function POST(req: Request) {
  try {
    console.log('POST request received');
    
    const { messages }: { messages: UIMessage[] } = await req.json();
    console.log("Received messages:", messages);

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    

    const myAgent = new Agent({
      model: google('models/gemini-2.0-flash-lite'), 
      system: SYSTEM_PROMPT,
      tools: {
        queryDatabaseTool,
        webSearchTool,
        searchDocumentsTool
      },
      toolChoice: 'auto',
      stopWhen: stepCountIs(10),
    });

    console.log('Agent created, starting response...');
    
    const response = await myAgent.respond({
      messages: await validateUIMessages({ messages }),
    });

    console.log('Agent response completed successfully');
    return response;

  } catch (error) {
    console.error('API Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error),
        stack: process.env.NODE_ENV === 'development' && typeof error === 'object' && error !== null && 'stack' in error ? (error as { stack?: string }).stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}









