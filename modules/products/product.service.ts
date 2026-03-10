import { productRepository } from "./product.repository";
import { CreateProductPayload } from "./product.schema";

export const productService = {
	async create(data: CreateProductPayload) {
		const newData = {
			...data,
			price: String(data.price),
		};
		const product = await productRepository.create(newData);
        
		return {
			...product,
			price: parseFloat(product.price),
		};
	},
	async getById(id: string) {
		const product = await productRepository.findById(id);
		if (!product) return null;

		return {
			...product,
			price: parseFloat(product.price),
			providers: product.productProvidersTable.map((pp) => pp.provider),
		};
	},
};
