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

type UpdateProductRepoPayload = Omit<UpdateProductPayload, "price" | "providerIds"> & {
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
	async updateById(id: string, data: UpdateProductRepoPayload) {
		const [updated] = await db
			.update(productsTable)
			.set(data)
			.where(eq(productsTable.id, id))
			.returning();

		return updated ?? null;
	},
	async findAll({ fields, limit, page, sort, filters }: FindAllRepoParams) {
		const offset = (page - 1) * limit;

		const rows = await db
			.select(pickFields(fields))
			.from(productsTable)
			.where(buildFilters(filters))
			.orderBy(...buildSort(sort))
			.limit(limit)
			.offset(offset);

		let [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(productsTable);
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
