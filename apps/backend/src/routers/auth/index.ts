import { router } from "../../trpc";
import { google } from "./google";
import { me } from "./me";

export const authRouter = router({
	google,
	me,
});
