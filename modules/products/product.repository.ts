import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	gte,
	like,
	lte,
	sql,
} from "drizzle-orm";
import { db } from "../../db";
import {
	CreateProductPayload,
	ProductQuery,
	UpdateProductPayload,
} from "./product.schema";
import { productProvidersTable, productsTable } from "../../db/schema";

type CreateProductRepoPayload = Omit<CreateProductPayload, "price"> & {
	price: string;
};

type UpdateProductRepoPayload = Omit<
	UpdateProductPayload,
	"price" | "providerIds"
> & {
	price?: string;
};

type ProductFilters = {
	nameLike?: string;
	priceGte?: number;
	priceLte?: number;
	isActive?: boolean;
	name?: string;
};

type FindAllRepoParams = Required<Pick<ProductQuery, "page" | "limit">> &
	Pick<ProductQuery, "sort"> & {
		fields?: string[];
		filters?: ProductFilters;
	};

const pickFields = (fields: string[] | undefined) => {
	const allColumns = getTableColumns(productsTable);
	if (!fields) {
		return allColumns;
	}
	return Object.fromEntries(
		fields
			.filter((f) => f in allColumns)
			.map((f) => [f, allColumns[f as keyof typeof allColumns]]),
	);
};

const buildSort = (sortMethod: string | undefined) => {
	if (!sortMethod) return [];

	const allColumns = getTableColumns(productsTable);
	return sortMethod.split(",").map((field) => {
		const descending = field.startsWith("-");
		const key = descending ? field.slice(1) : field;
		const col = productsTable[key as keyof typeof allColumns];
		return descending ? desc(col) : asc(col);
	});
};

const buildFilters = (filters: ProductFilters | undefined) => {
	if (!filters) return undefined;

	const conditions = [];

	if (filters.name) {
		conditions.push(eq(productsTable.name, filters.name));
	}
	if (filters.nameLike) {
		conditions.push(like(productsTable.name, `%${filters.nameLike}%`));
	}
	if (filters.priceGte) {
		conditions.push(gte(productsTable.price, String(filters.priceGte)));
	}
	if (filters.priceLte) {
		conditions.push(lte(productsTable.price, String(filters.priceLte)));
	}
	if (filters.isActive !== undefined) {
		conditions.push(eq(productsTable.isActive, filters.isActive));
	}

	return conditions.length ? and(...conditions) : undefined;
};

export const productRepository = {
	async delete(id: string) {
		const [deleted] = await db
			.delete(productsTable)
			.where(eq(productsTable.id, id))
			.returning();

		return deleted;
	},
	async updateById(
		id: string,
		data: UpdateProductRepoPayload,
		providerIds?: string[],
	) {
		const updated = await db.transaction(async (tx) => {
			const [updated] = await tx
				.update(productsTable)
				.set(data)
				.where(eq(productsTable.id, id))
				.returning();

			if (providerIds != null && updated) {
				await tx
					.delete(productProvidersTable)
					.where(eq(productProvidersTable.productId, updated.id));

				if (providerIds.length > 0) {
					const newIds = [...new Set(providerIds)];
					await tx
						.insert(productProvidersTable)
						.values(
							newIds.map((id) => ({ productId: updated.id, providerId: id })),
						);
				}
			}

			return updated;
		});

		if (!updated) {
			return null;
		}

		const result = await db.query.productsTable.findFirst({
			where: eq(productsTable.id, updated.id),
			with: {
				productProvidersTable: {
					with: {
						provider: true,
					},
				},
				productsCategoriesTable: true,
			},
		});

		return result;
	},
	async findAll({ fields, limit, page, sort, filters }: FindAllRepoParams) {
		const offset = (page - 1) * limit;

		const newFilters = buildFilters(filters);
		const rows = await db
			.select(pickFields(fields))
			.from(productsTable)
			.where(newFilters)
			.orderBy(...buildSort(sort))
			.limit(limit)
			.offset(offset);

		let [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(productsTable)
			.where(newFilters);

		count = Number(count);

		return {
			data: rows,
			meta: {
				page,
				limit,
				totalItems: count,
				totalPages: Math.ceil(count / limit),
			},
		};
	},
	async create(data: CreateProductRepoPayload) {
		const { providerIds, ...productData } = data;

		const prod = await db.transaction(async (tx) => {
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

		const result = await db.query.productsTable.findFirst({
			where: eq(productsTable.id, prod.id),
			with: {
				productProvidersTable: {
					with: {
						provider: true,
					},
				},
				productsCategoriesTable: true,
			},
		});

		if (!result) throw new Error("Product not found after creation!");

		return result;
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
				productsCategoriesTable: true,
			},
		});

		return product;
	},
};
