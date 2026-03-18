import z from "zod";

export const createOrgDto = z.object({
	name: z.string().min(1).max(100),
});
