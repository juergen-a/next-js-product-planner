import type { Sql } from 'postgres';

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE products (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      product_name varchar(30) NOT NULL,
      product_color varchar(30) NOT NULL,
      price_purchase decimal DEFAULT 0 NOT NULL,
      price_retail decimal DEFAULT 0 NOT NULL,
      units_plan_month integer DEFAULT 0 NOT NULL,
      yearly_totals decimal DEFAULT 0 NOT NULL,
      /* value_plan_month decimal DEFAULT 0 NOT NULL, -- calc
      value_plan_year decimal DEFAULT 0 NOT NULL, -- calc
      costs_dev decimal DEFAULT 0 NOT NULL, -- plan
      costs_admin decimal DEFAULT 0 NOT NULL, -- plan
      gross_margin decimal DEFAULT 0 NOT NULL*/ -- calc
      months integer DEFAULT 0 NOT NULL,
      years integer DEFAULT 2025 NOT NULL
      /*user_id integer */
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE products`;
}
