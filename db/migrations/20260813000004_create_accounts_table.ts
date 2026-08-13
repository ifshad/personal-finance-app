import type { Knex } from "knex";

const TABLE = "accounts";

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
    table.string("name", 100).notNullable();
    table
      .enum("account_type", ["CASH", "BANK", "MOBILE_WALLET", "CARD", "OTHER"])
      .notNullable();
    table.decimal("opening_balance", 15, 2).notNullable().defaultTo(0);
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(["user_id", "is_active"]);
    table.index(["user_id", "account_type"]);
    table.check("?? >= 0", ["opening_balance"], "accounts_opening_balance_nonnegative");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
