import Elysia from "elysia";
import { productService } from "./product.service";
import {
	createProductSchema,
	productParamsSchema,
	productQuerySchema,
	updateProductSchema,
} from "./product.schema";

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
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const product = await productService.getById(id);
			if (!product) {
				set.status = 404;
				return {
					success: false,
					error: { code: "NOT_FOUND", message: "Product not found" },
				};
			}

			return {
				success: true,
				data: product,
			};
		},
		{
			params: productParamsSchema,
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
		},
	)
	.delete("/:id", async ({ params: { id } }) => {
		await productService.delete(id);

		return new Response(null, { status: 204 });
	})
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
		},
	);
