import type { Knex } from "knex";

const TABLE = "budget_items";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE, (table) => {
    table.increments("id").primary();
    table
      .integer("budget_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("budgets")
      .onDelete("CASCADE");
    table
      .integer("category_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("categories")
      .onDelete("RESTRICT");
    table.decimal("planned_amount", 15, 2).notNullable();
    table.timestamps(true, true);

    table.unique(["budget_id", "category_id"]);
    table.check("?? >= 0", ["planned_amount"], "budget_items_planned_amount_nonnegative");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
