import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../../backend/src/routers/routers";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "/trpc"
    : "http://localhost:8787/trpc";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: baseURL,
    }),
  ],
});

export default client;
