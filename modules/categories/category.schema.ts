import { t } from "elysia";

export const createCategorySchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 50 }),
	description: t.Optional(t.String({ minLength: 1 })),
});

export const updateCategorySchema = t.Partial(createCategorySchema);

export const categoryQuerySchema = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
	fields: t.Optional(t.String()),
	sort: t.Optional(t.String()),
	"name[like]": t.Optional(t.String()),
});

export const categoryParamsSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export type CreateCategoryPayload = typeof createCategorySchema.static;
export type UpdateCategoryPayload = typeof updateCategorySchema.static;
export type CategoryQuery = typeof categoryQuerySchema.static;
export type CategoryParams = typeof categoryParamsSchema.static;
