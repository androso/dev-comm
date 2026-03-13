import { Elysia, ValidationError, status } from "elysia";
import type { ErrorDetail } from "../common/errors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { db } from "../db";
import { productRoutes } from "../modules/products/product.routes";
import { providerRoutes } from "../modules/providers/provider.routes";
import { categoryRoutes } from "../modules/categories/category.routes";
import { BadRequestError } from "../common/errors";

try {
	await db.execute("select 1");
	const apiV1 = new Elysia({ prefix: "/api/v1" })
		.use(productRoutes)
		.use(providerRoutes)
		.use(categoryRoutes);

	const app = new Elysia()
		.use(
			swagger({
				documentation: {
					info: {
						title: "Dev Commerce API",
						version: "1.0.0",
						description:
							"REST API for managing products, providers, and categories.",
					},
					tags: [
						{ name: "Products", description: "Product management endpoints" },
						{ name: "Providers", description: "Provider management endpoints" },
						{
							name: "Categories",
							description: "Category management endpoints",
						},
					],
				},
				path: "/swagger",
				exclude: ["/swagger", "/swagger/json"],
			}),
		)
		.onError(({ code, path, error, request }) => {
			switch (code) {
				case "VALIDATION": {
					const details: ErrorDetail[] = [];

					if (error instanceof ValidationError) {
						for (const err of error.all) {
							const field = err.path.replace(/^\//, "") || error.type;
							details.push({
								field,
								message: err.summary ?? err.message,
							});
						}
					}

					return status(422, {
						success: false,
						error: {
							code: "VALIDATION_ERROR",
							message: "Request validation failed",
							...(details.length > 0 && { details }),
						},
					});
				}
				case "NOT_FOUND":
					return status(404, {
						success: false,
						error: {
							code: "NOT_FOUND",
							message: error.message || "Resource not found",
						},
					});
				case "PARSE":
					return status(400, {
						success: false,
						error: {
							code: "BAD_REQUEST",
							message: "Malformed request body",
						},
					});
				default:
					if (error instanceof BadRequestError) {
						return status(400, {
							success: false,
							error: {
								code: "BAD_REQUEST",
								message: error.message,
								...(error.details && { details: error.details }),
							},
						});
					}
					console.error("Unhandled error", {
						code,
						path,
						method: request.method,
						message: error instanceof Error ? error.message : String(error),
						error,
					});

					return status(500, {
						success: false,
						error: {
							code: "INTERNAL_SERVER_ERROR",
							message: "Internal server error",
						},
					});
			}
		})
		.use(apiV1)
	.use(staticPlugin({ assets: "frontend/dist", prefix: "/" }))
	.get("/*", () => Bun.file("frontend/dist/index.html"));

	app.listen(3000);
	console.log("App working on port: ", app.server?.port);
} catch (e) {
	console.error("Database connection failed: ", e);
	process.exit(1);
}
