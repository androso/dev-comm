import Elysia from "elysia";
import {
	createProviderSchema,
	providerParamsSchema,
	providerQuerySchema,
	updateProviderSchema,
} from "./provider.schema";
import { providerService } from "./provider.service";

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
		{ query: providerQuerySchema },
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
		{ body: updateProviderSchema, params: providerParamsSchema },
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			await providerService.delete(id);
			return new Response(null, { status: 204 });
		},
		{
			params: providerParamsSchema,
		},
	);
