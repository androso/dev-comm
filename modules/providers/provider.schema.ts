import { t } from "elysia";

export const createProviderSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 255 }),
	address: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	phone: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
	description: t.Optional(t.String()),
	email: t.Optional(
		t.String({ format: "email", minLength: 1, maxLength: 255 }),
	),
	isActive: t.Optional(t.Boolean()),
});

export const updateProviderSchema = t.Partial(createProviderSchema);

export const providerQuerySchema = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
	fields: t.Optional(t.String()),
	sort: t.Optional(t.String()),
	"name[like]": t.Optional(t.String()),
	isActive: t.Optional(t.BooleanString()),
});

export const providerParamsSchema = t.Object({
	id: t.String({ format: "uuid" }),
});

export const providerResponseDataSchema = t.Object({
	id: t.String({ format: "uuid" }),
	name: t.String(),
	address: t.Nullable(t.String()),
	phone: t.Nullable(t.String()),
	description: t.Nullable(t.String()),
	email: t.Nullable(t.String()),
	isActive: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});

export const providerListItemSchema = t.Partial(providerResponseDataSchema);

export type CreateProviderPayload = typeof createProviderSchema.static;
export type UpdateProviderPayload = typeof updateProviderSchema.static;
export type ProviderQuery = typeof providerQuerySchema.static;
export type ProviderParams = typeof providerParamsSchema.static;
