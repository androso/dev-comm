import { eq } from "drizzle-orm";
import { db } from "../../db";
import { providersTable } from "../../db/schema";
import { createProviderPayload } from "./provider.schema";

export const providerRepository = {
	async create(data: createProviderPayload) {
		const [provider] = await db.insert(providersTable).values(data).returning();
		return provider;
	},
	async findById(id: string) {
		const provider = await db.query.providersTable.findFirst({
			where: eq(providersTable.id, id),
		});

		return provider;
	},
};
