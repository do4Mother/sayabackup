import { router } from "../trpc";
import { authRouter } from "./auth";

const appRouter = router({
	auth: authRouter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
