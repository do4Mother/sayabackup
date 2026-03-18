import z from "zod";

export const inviteDto = z.object({
	organizationId: z.string(),
	email: z.string().email(),
});
