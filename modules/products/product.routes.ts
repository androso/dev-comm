import Elysia from "elysia";
import { productService } from "./product.service";

export const productRoutes = new Elysia({ prefix: "/products" }).get(
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
);
