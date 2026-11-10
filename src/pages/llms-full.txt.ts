// Static endpoint: /llms-full.txt (PRD 8.1), generated from landing.ts at build time.
import type { APIRoute } from 'astro';
import { llmsFull } from '../content/agent-doc.ts';

export const GET: APIRoute = () =>
  new Response(llmsFull(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
