import { providerRepository } from "./provider.repository";
import { CreateProviderPayload } from "./provider.schema";

export const providerService = {
	async create(data: CreateProviderPayload) {
		const provider = await providerRepository.create(data);

		return provider;
	},
};
