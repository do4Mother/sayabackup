import { publicProcedure, router } from '../trpc';

const appRouter = router({
  hello: publicProcedure.query(() => {
    return 'Hello from tRPC on Cloudflare Workers!';
  })
})

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };

