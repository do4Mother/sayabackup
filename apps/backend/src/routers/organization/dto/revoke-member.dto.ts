import z from "zod";

export const revokeMemberDto = z.object({
	organizationId: z.string(),
	userId: z.number(),
});
