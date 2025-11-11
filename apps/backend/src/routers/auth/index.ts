import { router } from "../../trpc";
import { decryptS3 } from "./decrypt_s3";
import { google } from "./google";
import { me } from "./me";
import { s3credentials } from "./s3credentials";

export const authRouter = router({
	google,
	me,
	s3credentials,
	decryptS3,
});
