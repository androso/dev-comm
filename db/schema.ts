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
	created_at: timestamp().defaultNow().notNull(),
	updated_at: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	email: varchar('email', { length: 255 }),
	is_active: boolean("is_active").default(true)
});

export const productsTable = pgTable("products", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	description: text(),
	created_at: timestamp().defaultNow().notNull(),
	updated_at: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	sku: varchar({ length: 50 }),
	stock_quantity: integer().default(0),
	category_id: uuid("category_id").references(() => productsCategories.id),
	image_url: varchar({length: 2048}),
	is_active: boolean().default(true),
});

export const productProviders = pgTable(
	"product_providers",
	{
		product_id: uuid()
			.notNull()
			.references(() => productsTable.id, { onDelete: "cascade" }),
		provider_id: uuid()
			.notNull()
			.references(() => providersTable.id, { onDelete: "cascade" }),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.product_id, table.provider_id] }),
	}),
);

export const productsCategories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 50 }).notNull().unique(),
	description: text("description"),
	created_at: timestamp().defaultNow().notNull(),
	updated_at: timestamp()
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});