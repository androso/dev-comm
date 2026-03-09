import { Elysia } from "elysia";
import { db } from "../db";

try {
	await db.execute("select 1");
	const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);
	app.get("/health", () => ({ status: "ok" }));
	console.log("App working on port: ", app.server?.port);
} catch (e) {
	console.error("Database connection failed: ", e);
	process.exit(1);
}