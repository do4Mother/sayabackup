import z from "zod";

export const userDto = z.object({
	id: z.number(),
	email: z.email(),
});
