import type { Knex } from "knex";

const TABLE = "categories";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE, (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("parent_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable(TABLE)
      .onDelete("RESTRICT");
    table.string("name", 100).notNullable();
    table.enum("type", ["INCOME", "EXPENSE"]).notNullable();
    table.string("icon", 50).nullable();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(["user_id", "type", "is_active"]);
    table.index(["user_id", "parent_id"]);
  });

  // A category cannot be its own parent, and a parent must be a top-level
  // category (no more than two levels — matches the UI's category/
  // subcategory hierarchy). Enforced in the service layer alongside the
  // "same user" and "no duplicate name in the same scope" rules, since
  // MySQL treats every NULL as distinct and can't express "unique name
  // among top-level categories" as a single clean constraint.
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
