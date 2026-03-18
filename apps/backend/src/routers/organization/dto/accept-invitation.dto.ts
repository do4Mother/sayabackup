import z from "zod";

export const acceptInvitationDto = z.object({
	token: z.string(),
});
