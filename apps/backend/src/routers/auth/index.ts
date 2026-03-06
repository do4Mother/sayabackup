import { router } from "../../trpc";
import { google } from "./google";
import { logout } from "./logout";
import { me } from "./me";
import { secret } from "./secret";

export const authRouter = router({
	google,
	me,
	logout,
	secret,
});
