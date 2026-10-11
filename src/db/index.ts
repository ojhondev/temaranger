import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

function connect(): DB {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurada. Rode `npx vercel@latest env pull .env.local` ou preencha .env.local.",
    );
  }
  return drizzle(neon(url), { schema, casing: "snake_case" });
}

/** Cliente Drizzle, criado sob demanda na primeira consulta. */
export const db = new Proxy({} as DB, {
  get(_t, prop) {
    if (!_db) _db = connect();
    const value = _db[prop as keyof DB];
    return typeof value === "function" ? value.bind(_db) : value;
  },
});

export { schema };
