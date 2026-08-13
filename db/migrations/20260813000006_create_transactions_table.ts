import type { Knex } from "knex";

const TABLE = "transactions";

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
    table.enum("type", ["INCOME", "EXPENSE", "TRANSFER"]).notNullable();
    table.decimal("amount", 15, 2).notNullable();

    // INCOME / EXPENSE use account_id + category_id.
    table
      .integer("account_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("accounts")
      .onDelete("RESTRICT");
    table
      .integer("category_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("categories")
      .onDelete("RESTRICT");

    // TRANSFER uses from_account_id + to_account_id instead.
    table
      .integer("from_account_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("accounts")
      .onDelete("RESTRICT");
    table
      .integer("to_account_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("accounts")
      .onDelete("RESTRICT");

    table.string("description", 255).nullable();
    table.text("notes").nullable();
    table.date("transaction_date").notNullable();
    table.timestamps(true, true);

    table.index(["user_id", "transaction_date"]);
    table.index(["user_id", "type", "transaction_date"]);
    table.index(["user_id", "account_id", "transaction_date"]);
    table.index(["user_id", "category_id", "transaction_date"]);
    table.index(["user_id", "from_account_id", "transaction_date"]);
    table.index(["user_id", "to_account_id", "transaction_date"]);

    table.check("?? > 0", ["amount"], "transactions_amount_positive");

    // Defense in depth for the type-shape invariants from the financial
    // model: INCOME/EXPENSE use account_id+category_id and never touch the
    // transfer columns; TRANSFER uses from/to and never account_id/category_id,
    // and can't transfer an account into itself. The service layer validates
    // the same rules before this is ever reached.
    table.check(
      `
      (type IN ('INCOME', 'EXPENSE')
        AND account_id IS NOT NULL AND category_id IS NOT NULL
        AND from_account_id IS NULL AND to_account_id IS NULL)
      OR
      (type = 'TRANSFER'
        AND account_id IS NULL AND category_id IS NULL
        AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL
        AND from_account_id <> to_account_id)
      `,
      undefined,
      "transactions_type_shape",
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLE);
}
