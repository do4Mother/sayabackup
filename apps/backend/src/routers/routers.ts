import { inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { albumRouter } from "./album";
import { authRouter } from "./auth";
import { galleryRouter } from "./gallery";

const appRouter = router({
	auth: authRouter,
	gallery: galleryRouter,
	album: albumRouter,
});

type AppRouter = typeof appRouter;
type AppRouterOutput = inferRouterOutputs<AppRouter>;

export { appRouter };
export type { AppRouter, AppRouterOutput };
