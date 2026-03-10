import { Elysia } from "elysia";
import { db } from "../db";
import { productRoutes } from "../modules/products/product.routes";

try {
	await db.execute("select 1");
	const app = new Elysia().use(productRoutes);

	app.listen(3000);
	console.log("App working on port: ", app.server?.port);
} catch (e) {
	console.error("Database connection failed: ", e);
	process.exit(1);
}
