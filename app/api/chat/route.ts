import { streamText, UIMessage, convertToModelMessages, stepCountIs, validateUIMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { queryDatabaseTool } from '@/lib/ai/tools/sql-tool';
import { SYSTEM_PROMPT } from './system-prompt';
import { webSearchTool } from '@/lib/ai/tools/web-search-tool';
import { searchDocumentsTool } from '@/lib/ai/tools/vector-search-tool';
import { Experimental_Agent as Agent } from 'ai';

export const maxDuration = 30;


export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: 'Bonjour, API fonctionne correctement' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();


const myAgent = new Agent({

    model: google('models/gemini-2.0-flash-lite'), 
    system: SYSTEM_PROMPT,
    
    tools: {
      queryDatabaseTool,
      webSearchTool,
      searchDocumentsTool
    },
    toolChoice: 'auto',
    stopWhen : stepCountIs(10),
    
  });

  const stream = myAgent.stream({
  prompt: SYSTEM_PROMPT,
});

return myAgent.respond({
    messages: await validateUIMessages({ messages }),
  });

}









