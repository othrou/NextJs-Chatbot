import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from "next/server";


// Allow streaming responses up to 30 seconds
const maxDuration = 30;

//req is short for request
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { message: "Ton API pour RAG est healthy" },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { 
    messages: UIMessage[]; 
    model: string; 
    webSearch: boolean;
  } = await req.json();

  const result = streamText({
    /*model: webSearch ? 'perplexity/sonar' : model,*/
    model: google('gemini-2.0-flash-exp'),
    tools: webSearch 
      ? {
          google_search: google.tools.googleSearch({}),
        }
      : undefined,
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
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

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
