import { Elysia, status } from "elysia";
import { db } from "../db";
import { productRoutes } from "../modules/products/product.routes";
import { providerRoutes } from "../modules/providers/provider.routes";

try {
	await db.execute("select 1");
	const app = new Elysia()
		.onError(({ code, path, error, request }) => {
			switch (code) {
				case "VALIDATION":
					return status(400, {
						success: false,
						error: {
							code: "BAD_REQUEST",
							message: "Request validation failed",
						},
					});
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
		.use(productRoutes)
		.use(providerRoutes);

	app.listen(3000);
	console.log("App working on port: ", app.server?.port);
} catch (e) {
	console.error("Database connection failed: ", e);
	process.exit(1);
}
