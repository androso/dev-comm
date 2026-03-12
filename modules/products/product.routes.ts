import Elysia from "elysia";
import { productService } from "./product.service";
import {
	createProductSchema,
	productDetailResponseSchema,
	productListItemSchema,
	productParamsSchema,
	productQuerySchema,
	productResponseDataSchema,
	updateProductSchema,
} from "./product.schema";
import {
	errorResponseSchema,
	jsonResponse,
	paginatedResponseSchema,
	successResponseSchema,
} from "../../common/response-schemas";

export const productRoutes = new Elysia({ prefix: "/products" })
	.get(
		"/",
		async ({ query }) => {
			const result = await productService.getAll(query);
			return {
				success: true,
				...result,
			};
		},
		{
			query: productQuerySchema,
			detail: {
				tags: ["Products"],
				summary: "List products",
				description:
					"Retrieve a paginated list of products with optional filtering, sorting, and field selection.",
				responses: {
					200: jsonResponse(paginatedResponseSchema(productListItemSchema), "Successful response"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			const product = await productService.getById(id);

			return {
				success: true,
				data: product,
			};
		},
		{
			params: productParamsSchema,
			detail: {
				tags: ["Products"],
				summary: "Get product by ID",
				description:
					"Retrieve a single product by its UUID, including its associated providers.",
				responses: {
					200: jsonResponse(successResponseSchema(productDetailResponseSchema), "Successful response"),
					404: jsonResponse(errorResponseSchema, "Product not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const prod = await productService.create({
				...body,
				price: body.price,
			});

			set.status = 201;

			return {
				success: true,
				data: prod,
			};
		},
		{
			body: createProductSchema,
			detail: {
				tags: ["Products"],
				summary: "Create a product",
				description:
					"Create a new product. Optionally associate it with providers via providerIds.",
				responses: {
					201: jsonResponse(successResponseSchema(productResponseDataSchema), "Product created"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			await productService.delete(id);

			return new Response(null, { status: 204 });
		},
		{
			params: productParamsSchema,
			detail: {
				tags: ["Products"],
				summary: "Delete a product",
				description:
					"Delete a product by its UUID. Returns 204 No Content on success.",
				responses: {
					204: { description: "Product deleted" },
					404: jsonResponse(errorResponseSchema, "Product not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, set }) => {
			const product = await productService.updateById(id, body);

			set.status = 200;

			return {
				success: true,
				data: product,
			};
		},
		{
			params: productParamsSchema,
			body: updateProductSchema,
			detail: {
				tags: ["Products"],
				summary: "Update a product",
				description:
					"Partially update an existing product by its UUID.",
				responses: {
					200: jsonResponse(successResponseSchema(productResponseDataSchema), "Product updated"),
					400: jsonResponse(errorResponseSchema, "Bad request"),
					404: jsonResponse(errorResponseSchema, "Product not found"),
					422: jsonResponse(errorResponseSchema, "Validation error"),
				},
			},
		},
	);
