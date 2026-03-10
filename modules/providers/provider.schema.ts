import { t } from "elysia";

export const createProviderSchema = t.Object({
	name: t.String({ minLength: 1 }),
	address: t.Optional(t.String({ minLength: 1 })),
	phone: t.Optional(t.String({ minLength: 1, maxLength: 20 })),
	description: t.Optional(t.String()),
	email: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	isActive: t.Optional(t.Boolean()),
});

export const updateProviderSchema = t.Partial(createProviderSchema);

export const providerQuerySchema = t.Object({
    page: t.Optional(t.Numeric({minimum: 1})),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
    fields: t.Optional(t.String()),
    sort: t.Optional(t.String())
})

export const providerParamsSchema = t.Object({
    id: t.String({ format: "uuid" })
})


export type CreateProviderPayload = typeof createProviderSchema.static
export type UpdateProviderPayload = typeof updateProviderSchema.static
export type ProviderQuery = typeof providerQuerySchema.static
export type ProviderParams = typeof providerParamsSchema.static