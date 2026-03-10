import { Elysia } from "elysia";
import { db } from "../db";
import { productRoutes } from "../modules/products/product.routes";

try {
	await db.execute("select 1");
	const app = new Elysia()
		.onError(({ code, error, set}) => {
			if (code === "VALIDATION"){
				set.status = 400
				return {
					success: false,
					error: {
						code: "BAD_REQUEST",
						message: "Request validation failed"
					}
				}
			}

			if (set.status && set.status !== 200) {
				return {
					succes: false,
					error: {
						code,
						message: "Request failed" 
					}
				}
			}

			set.status = 500
			
			return {
				success: false,
				error: {
					code: "INTERNAL_SERVER_ERROR",
					message: "Unexpected error"
				}
			}
		})
		.use(productRoutes);

	app.listen(3000);
	console.log("App working on port: ", app.server?.port);
} catch (e) {
	console.error("Database connection failed: ", e);
	process.exit(1);
}
