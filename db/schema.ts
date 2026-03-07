import {
	decimal,
	integer,
	pgTable,
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
});

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
