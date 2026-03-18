import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { collectionCoach } from "./agents/collection-coach";

export const mastra = new Mastra({
  agents: { collectionCoach },
  storage: new LibSQLStore({
    id: "collected-mastra",
    url: process.env.TURSO_DATABASE_URL ?? "file:collected.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
});
