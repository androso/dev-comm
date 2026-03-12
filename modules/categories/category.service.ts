import { NotFoundError } from "elysia";
import { categoryRepository } from "./category.repository";
import {
	CategoryQuery,
	CreateCategoryPayload,
	UpdateCategoryPayload,
} from "./category.schema";

const DEFAULT_FIELDS = "id,name";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const categoryService = {
	async delete(id: string) {
		const deleted = await categoryRepository.delete(id);
		if (!deleted) {
			throw new NotFoundError("Category not found");
		}

		return deleted;
	},
	async updateById(id: string, data: UpdateCategoryPayload) {
		const updated = await categoryRepository.updateById(id, data);

		if (!updated) {
			throw new NotFoundError("Category not found");
		}

		return updated;
	},
	async create(data: CreateCategoryPayload) {
		const category = await categoryRepository.create(data);

		return category;
	},
	async getById(id: string) {
		const category = await categoryRepository.findById(id);
		if (!category) {
			throw new NotFoundError("Category not found!");
		}
		return category;
	},
	async getAll(query: CategoryQuery) {
		const params = {
			fields: (query.fields ?? DEFAULT_FIELDS).split(","),
			limit: query.limit ?? DEFAULT_LIMIT,
			page: query.page ?? DEFAULT_PAGE,
			sort: query.sort,
			filters: {
				nameLike: query["name[like]"],
			},
		};

		const res = await categoryRepository.findAll(params);
		return res;
	},
};
