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

const parseProductPrice = <T extends Record<string, unknown>>(product: T) => {
	if (typeof product.price !== "string") {
		return product;
	}

	return {
		...product,
		price: parseFloat(product.price),
	};
};

const toProductDetail = (product: NonNullable<Awaited<ReturnType<typeof productRepository.findById>>>) => {
	const { productProvidersTable, productsCategoriesTable, ...rest } = parseProductPrice(product);
	return {
		...rest,
		providers: productProvidersTable.map((pp) => pp.provider),
	};
};

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

		return toProductDetail(updated);
	},
	async create(data: CreateProductPayload) {
		const newData = {
			...data,
			price: String(data.price),
		};
		const product = await productRepository.create(newData);

		return toProductDetail(product);
	},
	async getById(id: string) {
		const product = await productRepository.findById(id);
		if (!product) {
			throw new NotFoundError("Product not found!");
		}
		return toProductDetail(product);
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
		return {
			...res,
			data: res.data.map((product) => parseProductPrice(product)),
		};
	},
};
