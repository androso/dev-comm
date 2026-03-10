import { eq } from "drizzle-orm";
import { db } from "../../db";
import { CreateProductPayload } from "./product.schema";
import { productProvidersTable, productsTable } from "../../db/schema";

type CreateProductRepoPayload = Omit<CreateProductPayload, "price"> & {
	price: string;
};

export const productRepository = {
	async create(data: CreateProductRepoPayload) {
		const { providerIds, ...productData } = data;

		return await db.transaction(async (tx) => {
			const [product] = await tx
				.insert(productsTable)
				.values(productData)
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
				productsCategoriesTable: true
			},
		});

		return product;
	},
};
