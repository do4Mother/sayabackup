/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with your frontend's origin or "*" for all origins
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization", // Add any custom headers your frontend sends
  "Access-Control-Max-Age": "86400", // Cache preflight results for 24 hours
};

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './routers/routers';

export default {
	async fetch(request, env, ctx): Promise<Response> {
	 // Handle OPTIONS requests (CORS preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Handle tRPC requests
    const response = await fetchRequestHandler({
      req: request,
      endpoint: "/trpc", // Adjust if your tRPC endpoint is different
      router: appRouter,
      onError({ error, path }) {
        console.error(`tRPC Error on '${path}'`, error);
      },
    });

    // Add CORS headers to all responses
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders)) {
      newHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
	},
} satisfies ExportedHandler<Env>;
