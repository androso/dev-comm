import Elysia from "elysia";
import { categoryService } from "./category.service";
import {
	categoryListItemSchema,
	categoryParamsSchema,
	categoryQuerySchema,
	categoryResponseDataSchema,
	createCategorySchema,
	updateCategorySchema,
} from "./category.schema";
import {
	errorResponseSchema,
	jsonResponse,
	paginatedResponseSchema,
	successResponseSchema,
} from "../../common/response-schemas";

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
			detail: {
				tags: ["Categories"],
				summary: "List categories",
				description:
					"Retrieve a paginated list of categories with optional filtering, sorting, and field selection.",
				responses: {
					200: jsonResponse(paginatedResponseSchema(categoryListItemSchema), "Successful response"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
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
			detail: {
				tags: ["Categories"],
				summary: "Get category by ID",
				description: "Retrieve a single category by its UUID.",
				responses: {
					200: jsonResponse(successResponseSchema(categoryResponseDataSchema), "Successful response"),
					404: jsonResponse(errorResponseSchema, "Category not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
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
			detail: {
				tags: ["Categories"],
				summary: "Create a category",
				description: "Create a new category.",
				responses: {
					201: jsonResponse(successResponseSchema(categoryResponseDataSchema), "Category created"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
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
			detail: {
				tags: ["Categories"],
				summary: "Delete a category",
				description:
					"Delete a category by its UUID. Returns 204 No Content on success.",
				responses: {
					204: { description: "Category deleted" },
					404: jsonResponse(errorResponseSchema, "Category not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
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
			detail: {
				tags: ["Categories"],
				summary: "Update a category",
				description:
					"Partially update an existing category by its UUID.",
				responses: {
					200: jsonResponse(successResponseSchema(categoryResponseDataSchema), "Category updated"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					404: jsonResponse(errorResponseSchema, "Category not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	);
