import { router } from "../../trpc";
import { create } from "./create";
import { find } from "./find";
import { get } from "./get";
import { remove } from "./remove";
import { update } from "./update";

export const albumRouter = router({
	create,
	find,
	get,
	update,
	remove,
});
