import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(), name: text("name").notNull(),
  team: text("team"), role: text("role").notNull(), createdAt: text("created_at").notNull(),
});
export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(), iso3: text("iso3").notNull(), name: text("name").notNull(),
  price: real("price"), priceStatus: text("price_status").notNull(), pricePeriod: text("price_period"),
  energyYear: integer("energy_year"), generationTwh: real("generation_twh"), demandTwh: real("demand_twh"),
  renewableShare: real("renewable_share"), carbonIntensity: real("carbon_intensity"),
  mix: text("mix", { mode: "json" }).$type<{ nuclear: number; renewables: number; fossil: number }>(),
  dcRecords: integer("dc_records").notNull().default(0), clusterRecords: integer("cluster_records").notNull().default(0),
  priority: integer("priority", { mode: "boolean" }).notNull().default(false), updatedAt: text("updated_at"), priceRetrievedAt: text("price_retrieved_at"), energyRetrievedAt: text("energy_retrieved_at"),
});
export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(), title: text("title").notNull(), publisher: text("publisher").notNull(),
  url: text("url").notNull(), period: text("period"), type: text("type").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"), notes: text("notes"), retrievedAt: text("retrieved_at"),
});
export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(), data: text("data", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
});
export const verifications = sqliteTable("verifications", {
  id: integer("id").primaryKey({ autoIncrement: true }), sourceId: text("source_id").notNull(),
  userId: text("user_id").notNull(), userName: text("user_name").notNull(), notes: text("notes").notNull(),
  verifiedAt: text("verified_at").notNull(), status: text("status").notNull().default("current"),
});
export const refreshes = sqliteTable("refreshes", {
  id: integer("id").primaryKey({ autoIncrement: true }), source: text("source").notNull(),
  status: text("status").notNull(), detail: text("detail").notNull(), userId: text("user_id").notNull(),
  createdAt: text("created_at").notNull(),
});
export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), name: text("name").notNull(),
  inputs: text("inputs", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  results: text("results", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: text("created_at").notNull(),
});
export const adviserUsage = sqliteTable("adviser_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }), userId: text("user_id").notNull(),
  requestAt: text("request_at").notNull(), inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
});
export const designs = sqliteTable("designs", {
  id: text("id").primaryKey(), inputs: text("inputs", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  updatedAt: text("updated_at").notNull(), updatedBy: text("updated_by").notNull(),
});

export const proposalVersions = sqliteTable("proposal_versions", {
 id:text("id").primaryKey(), inputs:text("inputs",{mode:"json"}).$type<Record<string,unknown>>().notNull(), requirements:text("requirements",{mode:"json"}).$type<Record<string,unknown>>().notNull(), createdAt:text("created_at").notNull(), createdBy:text("created_by").notNull(),
});
