import Elysia from "elysia";
import {
	createProviderSchema,
	providerListItemSchema,
	providerParamsSchema,
	providerQuerySchema,
	providerResponseDataSchema,
	updateProviderSchema,
} from "./provider.schema";
import { providerService } from "./provider.service";
import {
	errorResponseSchema,
	jsonResponse,
	paginatedResponseSchema,
	successResponseSchema,
} from "../../common/response-schemas";

export const providerRoutes = new Elysia({ prefix: "/providers" })
	.post(
		"/",
		async ({ body, set }) => {
			const provider = await providerService.create(body);

			set.status = 201;

			return {
				success: true,
				data: provider,
			};
		},
		{
			body: createProviderSchema,
			detail: {
				tags: ["Providers"],
				summary: "Create a provider",
				description: "Create a new provider.",
				responses: {
					201: jsonResponse(successResponseSchema(providerResponseDataSchema), "Provider created"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			const provider = await providerService.getById(id);

			return {
				success: true,
				data: provider,
			};
		},
		{
			params: providerParamsSchema,
			detail: {
				tags: ["Providers"],
				summary: "Get provider by ID",
				description: "Retrieve a single provider by its UUID.",
				responses: {
					200: jsonResponse(successResponseSchema(providerResponseDataSchema), "Successful response"),
					404: jsonResponse(errorResponseSchema, "Provider not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.get(
		"/",
		async ({ query }) => {
			const res = await providerService.getAll(query);

			return {
				success: true,
				...res,
			};
		},
		{
			query: providerQuerySchema,
			detail: {
				tags: ["Providers"],
				summary: "List providers",
				description:
					"Retrieve a paginated list of providers with optional filtering, sorting, and field selection.",
				responses: {
					200: jsonResponse(paginatedResponseSchema(providerListItemSchema), "Successful response"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			const res = await providerService.updateById(id, body);
			set.status = 200;
			return {
				success: true,
				data: res,
			};
		},
		{
			body: updateProviderSchema,
			params: providerParamsSchema,
			detail: {
				tags: ["Providers"],
				summary: "Update a provider",
				description:
					"Partially update an existing provider by its UUID.",
				responses: {
					200: jsonResponse(successResponseSchema(providerResponseDataSchema), "Provider updated"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					404: jsonResponse(errorResponseSchema, "Provider not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			await providerService.delete(id);
			return new Response(null, { status: 204 });
		},
		{
			params: providerParamsSchema,
			detail: {
				tags: ["Providers"],
				summary: "Delete a provider",
				description:
					"Delete a provider by its UUID. Returns 204 No Content on success.",
				responses: {
					204: { description: "Provider deleted" },
					404: jsonResponse(errorResponseSchema, "Provider not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	);
