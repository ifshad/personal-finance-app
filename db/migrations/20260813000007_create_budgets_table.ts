import type { Knex } from "knex";

const TABLE = "budgets";

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
    table.string("name", 150).nullable();
    table.date("period_start").notNullable();
    table.date("period_end").notNullable();
    table.timestamps(true, true);

    table.index(["user_id", "period_start", "period_end"]);
    // One budget per exact period per user — avoids silently-duplicate
    // "monthly budgets" for the same month.
    table.unique(["user_id", "period_start", "period_end"]);
    table.check("?? >= ??", ["period_end", "period_start"], "budgets_period_valid");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
