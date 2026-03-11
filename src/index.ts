import { Elysia } from "elysia";
import { db } from "../db";
import { productRoutes } from "../modules/products/product.routes";

try {
	await db.execute("select 1");
	const app = new Elysia()
		.onError(({ code, set, error}) => {
			if (code === "VALIDATION"){
				set.status = 400
				console.error(error)
				return {
					success: false,
					error: {
						code: "BAD_REQUEST",
						message: "Request validation failed"
					}
				}
			}
			if (error){
				console.error(error)
			}
		})
		.use(productRoutes);

	app.listen(3000);
	console.log("App working on port: ", app.server?.port);
} catch (e) {
	console.error("Database connection failed: ", e);
	process.exit(1);
}
