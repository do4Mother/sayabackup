import { router } from "../../trpc";
import { create } from "./create";
import { get } from "./get";
import { update } from "./update";

export const galleryRouter = router({
	create,
	get,
	update,
});
