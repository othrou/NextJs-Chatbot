import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';

export const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });


export const webSearchTool = tool({
  description: 'Search the web for up-to-date information',
  inputSchema: z.object({
    query: z.string().min(1).max(100).describe('The search query')
  }),
  execute: async ({query}) => {
    const response = await tavilyClient.search(query)
    console.log("Web search results:", response.results);
    console.log("url:", response.results[0].url);
    return response.results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score,
    }));
  },
});

