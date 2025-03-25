import type { Sql } from 'postgres';

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE products (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      product_name varchar(30) NOT NULL,
      product_color varchar(30) NOT NULL,
      price_purchase decimal DEFAULT 0 NOT NULL,
      price_retail decimal DEFAULT 0 NOT NULL
      /*
      units_plan_month decimal DEFAULT 0 NOT NULL,
      units_plan_year decimal DEFAULT 0 NOT NULL,
      value_plan_month decimal DEFAULT 0 NOT NULL,
      value_plan_year decimal DEFAULT 0 NOT NULL,
      costs_dev decimal DEFAULT 0 NOT NULL,
      costs_purchase decimal DEFAULT 0 NOT NULL,
      gross_margin decimal DEFAULT 0 NOT NULL,
      MONTH integer DEFAULT 0 NOT NULL,
      YEAR integer DEFAULT 2025 NOT NULL,
      user_id integer*/
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE products`;
}
