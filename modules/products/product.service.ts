import { NotFoundError } from "elysia";
import { productRepository } from "./product.repository";
import {
	CreateProductPayload,
	ProductQuery,
	UpdateProductPayload,
} from "./product.schema";

const DEFAULT_FIELDS = "id,name,price,stockQuantity";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const productService = {
	async delete(id: string) {
		const deleted = await productRepository.delete(id);
		if (!deleted) {
			throw new NotFoundError("Product not found");
		}

		return deleted;
	},
	async updateById(id: string, data: UpdateProductPayload) {
		const { providerIds, price, ...rest } = data;

		const repoData = {
			...rest,
			...(price != null ? { price: String(data.price) } : {}),
		};

		const updated = await productRepository.updateById(
			id,
			repoData,
			providerIds,
		);

		if (!updated) {
			throw new NotFoundError("Product not found")
		}

		return updated;
	},
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
	async getAll(query: ProductQuery) {
		const params = {
			fields: (query.fields ?? DEFAULT_FIELDS).split(","),
			limit: query.limit ?? DEFAULT_LIMIT,
			page: query.page ?? DEFAULT_PAGE,
			sort: query.sort,
			filters: {
				name: query.name,
				priceGte: query["price[gte]"],
				priceLte: query["price[lte]"],
				nameLike: query["name[like]"],
				isActive: query.isActive,
			},
		};

		const res = await productRepository.findAll(params);
		return res;
	},
};
