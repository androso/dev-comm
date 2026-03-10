import { t } from "elysia";

export const createProductSchema = t.Object({
	name: t.String({ minLength: 1 }),
	price: t.Number({ minimum: 0 }),
	description: t.Optional(t.String({ minLength: 1 })),
	sku: t.Optional(t.String()),
	stockQuantity: t.Optional(t.Integer({ minimum: 0 })),
	categoryId: t.Optional(t.String({ format: "uuid" })),
	imageUrl: t.Optional(t.String({ format: "uri", maxLength: 2048 })),
	isActive: t.Optional(t.Boolean()),
	providerIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
});

export const updateProductSchema = t.Partial(createProductSchema);

export const productQuerySchema = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
	fields: t.Optional(t.String()),
	name: t.Optional(t.String()),
	isActive: t.Optional(t.BooleanString()),
	sort: t.Optional(t.String()),
	"price[gte]": t.Optional(t.Numeric({ minimum: 0 })),
	"price[lte]": t.Optional(t.Numeric({ minimum: 0 })),
	"name[like]": t.Optional(t.String()),
});

export const productParamsSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export type CreateProductPayload = typeof createProductSchema.static;
export type UpdateProductPayload = typeof updateProductSchema.static;
export type ProductQuery = typeof productQuerySchema.static;
export type ProductParams = typeof productParamsSchema.static;
