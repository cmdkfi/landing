// Static endpoint: /llms.txt (PRD 8.1), the short index, generated from landing.ts at build time.
import type { APIRoute } from 'astro';
import { llmsIndex } from '../content/agent-doc.ts';

export const GET: APIRoute = () =>
  new Response(llmsIndex(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
