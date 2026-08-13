import type { Knex } from "knex";

const TABLE = "user_profiles";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE, (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("first_name", 100).nullable();
    table.string("last_name", 100).nullable();
    table.string("display_name", 150).nullable();
    table.string("phone", 30).nullable();
    table.string("avatar_url", 500).nullable();
    table.string("currency", 3).notNullable().defaultTo("BDT");
    table.string("timezone", 50).notNullable().defaultTo("Asia/Dhaka");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
