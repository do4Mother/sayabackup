import z from "zod";

export const defaultParamsDto = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(48),
});

export const defaultCursorParamsDto = z.object({
	cursor: z.coerce.number().optional(),
	limit: z.number().min(1).max(100).default(48),
});
