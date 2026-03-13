import { inArray } from "drizzle-orm";
import { db } from "./index";
import {
	productProvidersTable,
	productsCategoriesTable,
	productsTable,
	providersTable,
} from "./schema";

async function seed() {
	console.log("Seeding database...");

	// 1. Categories — upsert by unique name, then fetch all seed rows
	const categoryNames = ["Electronics", "Clothing", "Food & Beverages"];
	await db
		.insert(productsCategoriesTable)
		.values([
			{ name: "Electronics", description: "Electronic devices and accessories" },
			{ name: "Clothing", description: "Apparel and fashion items" },
			{ name: "Food & Beverages", description: "Consumable food and drink products" },
		])
		.onConflictDoNothing();

	const categories = await db
		.select()
		.from(productsCategoriesTable)
		.where(inArray(productsCategoriesTable.name, categoryNames));

	console.log(`Upserted ${categories.length} categories`);

	// 2. Providers — upsert by unique name, then fetch all seed rows
	const providerNames = ["TechSupply Co.", "FashionWholesale Ltd.", "FreshFoods Inc."];
	await db
		.insert(providersTable)
		.values([
			{
				name: "TechSupply Co.",
				email: "contact@techsupply.com",
				phone: "555-0101",
				address: "123 Tech Ave, Silicon Valley, CA",
				description: "Leading supplier of electronic components",
			},
			{
				name: "FashionWholesale Ltd.",
				email: "orders@fashionwholesale.com",
				phone: "555-0202",
				address: "456 Fashion St, New York, NY",
				description: "Bulk clothing and apparel supplier",
			},
			{
				name: "FreshFoods Inc.",
				email: "supply@freshfoods.com",
				phone: "555-0303",
				address: "789 Market Rd, Chicago, IL",
				description: "Organic and fresh food distributor",
			},
		])
		.onConflictDoNothing();

	const providers = await db
		.select()
		.from(providersTable)
		.where(inArray(providersTable.name, providerNames));

	console.log(`Upserted ${providers.length} providers`);

	// 3. Products — upsert by unique SKU, then fetch all seed rows
	const electronics = categories.find((c) => c.name === "Electronics")!;
	const clothing = categories.find((c) => c.name === "Clothing")!;
	const food = categories.find((c) => c.name === "Food & Beverages")!;

	const skus = ["ELEC-001", "ELEC-002", "CLO-001", "CLO-002", "FOOD-001", "FOOD-002"];
	await db
		.insert(productsTable)
		.values([
			{
				name: "Wireless Headphones",
				price: "89.99",
				description: "Noise-cancelling over-ear wireless headphones",
				sku: "ELEC-001",
				stockQuantity: 50,
				categoryId: electronics.id,
				imageUrl: "https://placehold.co/400x400?text=Headphones",
			},
			{
				name: "USB-C Hub",
				price: "34.99",
				description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
				sku: "ELEC-002",
				stockQuantity: 120,
				categoryId: electronics.id,
			},
			{
				name: "Classic White T-Shirt",
				price: "19.99",
				description: "100% cotton unisex t-shirt",
				sku: "CLO-001",
				stockQuantity: 300,
				categoryId: clothing.id,
			},
			{
				name: "Running Sneakers",
				price: "64.99",
				description: "Lightweight mesh running shoes",
				sku: "CLO-002",
				stockQuantity: 80,
				categoryId: clothing.id,
			},
			{
				name: "Organic Green Tea",
				price: "12.49",
				description: "Premium loose-leaf organic green tea, 100g",
				sku: "FOOD-001",
				stockQuantity: 200,
				categoryId: food.id,
			},
			{
				name: "Cold Brew Coffee Kit",
				price: "24.99",
				description: "Everything you need to make cold brew at home",
				sku: "FOOD-002",
				stockQuantity: 60,
				categoryId: food.id,
			},
		])
		.onConflictDoNothing();

	const products = await db
		.select()
		.from(productsTable)
		.where(inArray(productsTable.sku, skus));

	console.log(`Upserted ${products.length} products`);

	// 4. Product-Provider relationships
	const techSupply = providers.find((p) => p.name === "TechSupply Co.")!;
	const fashionWholesale = providers.find((p) => p.name === "FashionWholesale Ltd.")!;
	const freshFoods = providers.find((p) => p.name === "FreshFoods Inc.")!;

	const headphones = products.find((p) => p.sku === "ELEC-001")!;
	const usbHub = products.find((p) => p.sku === "ELEC-002")!;
	const tshirt = products.find((p) => p.sku === "CLO-001")!;
	const sneakers = products.find((p) => p.sku === "CLO-002")!;
	const greenTea = products.find((p) => p.sku === "FOOD-001")!;
	const coldBrew = products.find((p) => p.sku === "FOOD-002")!;

	await db
		.insert(productProvidersTable)
		.values([
			{ productId: headphones.id, providerId: techSupply.id },
			{ productId: usbHub.id, providerId: techSupply.id },
			{ productId: tshirt.id, providerId: fashionWholesale.id },
			{ productId: sneakers.id, providerId: fashionWholesale.id },
			{ productId: greenTea.id, providerId: freshFoods.id },
			{ productId: coldBrew.id, providerId: freshFoods.id },
			{ productId: headphones.id, providerId: fashionWholesale.id },
		])
		.onConflictDoNothing();

	console.log("Upserted product-provider relationships");
	console.log("Done.");
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
