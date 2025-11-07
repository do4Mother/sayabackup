import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../../backend/src/routers/routers";

export const trpc = createTRPCReact<AppRouter>();
export const TRPCProvider = trpc.Provider;
export const queryClient = new QueryClient();
export const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:8787/trpc",
    }),
  ],
});
