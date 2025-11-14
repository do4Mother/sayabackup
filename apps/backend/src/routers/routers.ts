import { router } from "../trpc";
import { albumRouter } from "./album";
import { authRouter } from "./auth";
import { galleryRouter } from "./gallery";
import { s3Router } from "./s3";

const appRouter = router({
	auth: authRouter,
	s3: s3Router,
	gallery: galleryRouter,
	album: albumRouter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
