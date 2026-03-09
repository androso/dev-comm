import { eq } from "drizzle-orm";
import { db } from "../../db";
import { CreateProductPayload } from "./product.schema";
import { productProvidersTable, productsTable } from "../../db/schema";

export const productRepository = {
	async create(data: CreateProductPayload) {
		const { providerIds, ...productData } = data;

		return await db.transaction(async (tx) => {
			const [product] = await tx
				.insert(productsTable)
				.values({ ...productData, price: String(productData.price) })
				.returning();

			if (providerIds?.length) {
				await tx.insert(productProvidersTable).values(
					providerIds.map((provId) => ({
						productId: product.id,
						providerId: provId,
					})),
				);
			}

			return product;
		});
	},
	async findById(id: string) {
		const product = await db.query.productsTable.findFirst({
			where: eq(productsTable.id, id),
			with: {
				productProvidersTable: {
					with: {
						provider: true,
					},
				},
			},
		});

		return product;
	},
};
