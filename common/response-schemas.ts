import { t, type TSchema } from "elysia";

export const errorResponseSchema = t.Object({
	success: t.Literal(false),
	error: t.Object({
		code: t.String(),
		message: t.String(),
	}),
});

export const successResponseSchema = <T extends TSchema>(dataSchema: T) =>
	t.Object({
		success: t.Literal(true),
		data: dataSchema,
	});

export const paginatedResponseSchema = <T extends TSchema>(itemSchema: T) =>
	t.Object({
		success: t.Literal(true),
		data: t.Array(itemSchema),
		meta: t.Object({
			page: t.Number(),
			limit: t.Number(),
			offset: t.Number(),
			totalItems: t.Number(),
			totalPages: t.Number(),
		}),
	});

/** Helper to wrap a TypeBox schema into an OpenAPI response object */
export const jsonResponse = (schema: TSchema, description = "") => ({
	description,
	content: { "application/json": { schema } },
});
