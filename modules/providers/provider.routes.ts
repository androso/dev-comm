import Elysia from "elysia";
import { createProviderSchema } from "./provider.schema";
import { providerService } from "./provider.service";

export const providerRoutes = new Elysia({ prefix: "/providers" }).post(
	"/",
	async ({ body, set }) => {
		const provider = await providerService.create(body);

		set.status = 201;

		return provider;
	},
	{
		body: createProviderSchema,
	},
);
