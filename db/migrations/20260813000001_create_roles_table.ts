import type { Knex } from "knex";

const TABLE = "roles";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE, (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable().unique();
    table.timestamps(true, true);
  });

  await knex(TABLE).insert([{ name: "USER" }, { name: "ADMIN" }]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
