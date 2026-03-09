import {
	boolean,
	decimal,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const providersTable = pgTable("providers", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	description: text(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	email: varchar("email", { length: 255 }),
	isActive: boolean("is_active").default(true).notNull(),
});

export const productsCategoriesTable = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 50 }).notNull().unique(),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});

export const productsTable = pgTable("products", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	sku: varchar({ length: 50 }),
	stockQuantity: integer("stock_quantity").default(0),
	categoryId: uuid("category_id").references(() => productsCategoriesTable.id),
	imageUrl: varchar("image_url", { length: 2048 }),
	isActive: boolean("is_active").default(true).notNull(),
});

export const productProvidersTable = pgTable(
	"product_providers",
	{
		productId: uuid("product_id")
			.notNull()
			.references(() => productsTable.id, { onDelete: "cascade" }),
		providerId: uuid("provider_id")
			.notNull()
			.references(() => providersTable.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.productId, table.providerId] })],
);
