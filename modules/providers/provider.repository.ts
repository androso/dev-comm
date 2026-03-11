import { and, asc, desc, eq, getTableColumns, like, sql } from "drizzle-orm";
import { db } from "../../db";
import { providersTable } from "../../db/schema";
import { CreateProviderPayload, ProviderQuery } from "./provider.schema";

type ProviderFilters = {
	nameLike?: string;
	isActive?: boolean;
};

type FindAllProvidersParams = Required<Pick<ProviderQuery, "page" | "limit">> &
	Pick<ProviderQuery, "sort"> & {
		fields?: string[];
		filters?: ProviderFilters;
	};

const pickFields = (fields: string[] | undefined) => {
	const allColumns = getTableColumns(providersTable);
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

	const allColumns = getTableColumns(providersTable);
	return sortMethod.split(",").map((field) => {
		const descending = field.startsWith("-");
		const key = descending ? field.slice(1) : field;
		const col = providersTable[key as keyof typeof allColumns];
		return descending ? desc(col) : asc(col);
	});
};

const buildFilters = (filters: ProviderFilters | undefined) => {
	if (!filters) return undefined;

	const conditions = [];

	if (filters.nameLike) {
		conditions.push(like(providersTable.name, `%${filters.nameLike}%`));
	}
	if (filters.isActive !== undefined) {
		conditions.push(eq(providersTable.isActive, filters.isActive));
	}

	return conditions.length ? and(...conditions) : undefined;
};

export const providerRepository = {
	async create(data: CreateProviderPayload) {
		const [provider] = await db.insert(providersTable).values(data).returning();
		return provider;
	},
	async findById(id: string) {
		const provider = await db.query.providersTable.findFirst({
			where: eq(providersTable.id, id),
		});

		return provider;
	},
	async findAll({
		fields,
		limit,
		page,
		sort,
		filters,
	}: FindAllProvidersParams) {
		const offset = (page - 1) * limit;

		const rows = await db
			.select(pickFields(fields))
			.from(providersTable)
			.where(buildFilters(filters))
			.orderBy(...buildSort(sort))
			.limit(limit)
			.offset(offset);

		let [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(providersTable);

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
};
