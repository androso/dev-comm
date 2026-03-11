import { NotFoundError } from "elysia";
import { providerRepository } from "./provider.repository";
import {
	CreateProviderPayload,
	ProviderQuery,
	UpdateProviderPayload,
} from "./provider.schema";

const DEFAULT_FIELDS = "id,name,address,email";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const providerService = {
	async create(data: CreateProviderPayload) {
		const provider = await providerRepository.create(data);

		return provider;
	},
	async getById(id: string) {
		const provider = await providerRepository.findById(id);
		if (!provider) {
			throw new NotFoundError("Provider not found!");
		}
		return provider;
	},
	async getAll(query: ProviderQuery) {
		const queryFormatted = {
			fields: (query.fields ?? DEFAULT_FIELDS).split(","),
			page: query.page ?? DEFAULT_PAGE,
			limit: query.limit ?? DEFAULT_LIMIT,
			sort: query.sort,
			filters: {
				nameLike: query["name[like]"],
				isActive: query.isActive,
			},
		};

		const res = await providerRepository.findAll(queryFormatted);

		return res;
	},
	async updateById(id: string, data: UpdateProviderPayload) {
		const result = await providerRepository.updateById(id, data);

		return result;
	},
	async delete(id: string) {
		const deleted = await providerRepository.deleteById(id);

		return deleted;
	},
};
