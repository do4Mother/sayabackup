import { router } from "../../trpc";
import { create } from "./create";
import { get } from "./get";
import { move } from "./move";
import { remove } from "./remove";
import { update } from "./update";

export const galleryRouter = router({
	create,
	get,
	update,
	remove,
	move,
});
