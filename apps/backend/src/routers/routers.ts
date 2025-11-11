import { router } from "../trpc";
import { authRouter } from "./auth";
import { s3Router } from "./s3";

const appRouter = router({
	auth: authRouter,
	s3: s3Router,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
