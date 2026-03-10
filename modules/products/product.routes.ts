import Elysia from "elysia";

export const productRoutes = new Elysia({ prefix: "/products" })
    .get("/", "hey")
    .post("/", "hey")
