import path from "path";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrate } = await import("drizzle-orm/libsql/migrator");
    const { db } = await import("./lib/db");
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle/migrations"),
    });
  }
}
