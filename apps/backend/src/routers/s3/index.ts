import { router } from "../../trpc";
import { upload } from "./upload";

export const s3Router = router({
	upload,
});
