import z from "zod";

export const userDto = (props: { masking: boolean } = { masking: false }) =>
	z.object({
		id: z.number(),
		email: z.email(),
		key: z.string().transform((v) => (props.masking ? "" : v)),
	});
