import { and, asc, desc, eq, getTableColumns, like, sql } from "drizzle-orm";
import { db } from "../../db";

import { productsCategoriesTable } from "../../db/schema";
import {
	CategoryQuery,
	CreateCategoryPayload,
	UpdateCategoryPayload,
} from "./category.schema";
import { BadRequestError } from "../../common/errors";

type CategoryFilters = {
	nameLike?: string;
};

type FindAllRepoParams = Required<Pick<CategoryQuery, "page" | "limit">> &
	Pick<CategoryQuery, "sort"> & {
		fields?: string[];
		filters?: CategoryFilters;
	};

const pickFields = (fields: string[] | undefined) => {
	const allColumns = getTableColumns(productsCategoriesTable);
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

	const allColumns = getTableColumns(productsCategoriesTable);

	const invalidFields: string[] = [];
	const clauses = sortMethod
		.split(",")
		.map((field) => {
			field = field.trim();
			const descending = field.startsWith("-");
			const key = descending ? field.slice(1) : field;
			const col = allColumns[key as keyof typeof allColumns];

			if (!col) {
				invalidFields.push(key);
				return null;
			}

			return descending ? desc(col) : asc(col);
		})
		.filter((clause) => clause !== null);

	if (invalidFields.length > 0) {
		throw new BadRequestError(
			`Invalid sort field${invalidFields.length > 1 ? "s" : ""}: ${invalidFields.join(",")}`,
		);
	}

	return clauses;
};

const buildFilters = (filters: CategoryFilters | undefined) => {
	if (!filters) return undefined;

	const conditions = [];

	if (filters.nameLike) {
		conditions.push(
			like(productsCategoriesTable.name, `%${filters.nameLike}%`),
		);
	}

	return conditions.length ? and(...conditions) : undefined;
};

export const categoryRepository = {
	async delete(id: string) {
		const [deleted] = await db
			.delete(productsCategoriesTable)
			.where(eq(productsCategoriesTable.id, id))
			.returning();

		return deleted;
	},
	async updateById(id: string, data: UpdateCategoryPayload) {
		const [updated] = await db
			.update(productsCategoriesTable)
			.set(data)
			.where(eq(productsCategoriesTable.id, id))
			.returning();

		if (!updated) {
			return null;
		}

		return updated;
	},
	async findAll({ fields, limit, page, sort, filters }: FindAllRepoParams) {
		const offset = (page - 1) * limit;

		const newFilters = buildFilters(filters);
		const rows = await db
			.select(pickFields(fields))
			.from(productsCategoriesTable)
			.where(newFilters)
			.orderBy(...buildSort(sort))
			.limit(limit)
			.offset(offset);

		let [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(productsCategoriesTable)
			.where(newFilters);

		count = Number(count);

		return {
			data: rows,
			meta: {
				page,
				limit,
				offset,
				totalItems: count,
				totalPages: Math.ceil(count / limit),
			},
		};
	},
	async create(data: CreateCategoryPayload) {
		const [category] = await db
			.insert(productsCategoriesTable)
			.values(data)
			.returning();

		if (!category) throw new Error("Error when creating category!");

		return category;
	},
	async findById(id: string) {
		const category = await db.query.productsCategoriesTable.findFirst({
			where: eq(productsCategoriesTable.id, id),
		});

		return category;
	},
};
