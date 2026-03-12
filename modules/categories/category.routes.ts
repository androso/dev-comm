import Elysia from "elysia";
import { categoryService } from "./category.service";
import {
	categoryParamsSchema,
	categoryQuerySchema,
	createCategorySchema,
	updateCategorySchema,
} from "./category.schema";

export const categoryRoutes = new Elysia({ prefix: "/categories" })
	.get(
		"/",
		async ({ query }) => {
			const result = await categoryService.getAll(query);
			return {
				success: true,
				...result,
			};
		},
		{
			query: categoryQuerySchema,
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const category = await categoryService.getById(id);

			return {
				success: true,
				data: category,
			};
		},
		{
			params: categoryParamsSchema,
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const category = await categoryService.create(body);

			set.status = 201;

			return {
				success: true,
				data: category,
			};
		},
		{
			body: createCategorySchema,
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			await categoryService.delete(id);

			return new Response(null, { status: 204 });
		},
		{
			params: categoryParamsSchema,
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			const category = await categoryService.updateById(id, body);

			set.status = 200;

			return {
				success: true,
				data: category,
			};
		},
		{
			params: categoryParamsSchema,
			body: updateCategorySchema,
		},
	);
