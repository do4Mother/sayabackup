import { publicProcedure } from "../middlewares/public";
import { router } from "../trpc";
import { authRouter } from "./auth";

const appRouter = router({
	hello: publicProcedure.query(() => {
		return "Hello from tRPC on Cloudflare Workers!";
	}),
	auth: authRouter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
