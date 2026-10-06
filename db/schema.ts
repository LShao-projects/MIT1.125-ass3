import type {EmberObservations} from "@/lib/server/ember";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), email: text("email").notNull(), name: text("name").notNull(),
  team: text("team"), courseSection:text("course_section"), rulesAcceptedAt:text("rules_accepted_at"), rulesVersion:text("rules_version"), role: text("role").notNull(), createdAt: text("created_at").notNull(),
});
export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(), iso3: text("iso3").notNull(), name: text("name").notNull(),
  price: real("price"), priceStatus: text("price_status").notNull(), pricePeriod: text("price_period"),
  energyYear: integer("energy_year"), generationTwh: real("generation_twh"), demandTwh: real("demand_twh"),
  energyMetrics: text("energy_metrics", {mode:"json"}).$type<EmberObservations>(),
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
}, (table) => [index("idx_scenarios_user_created").on(table.userId, table.createdAt)]);
export const adviserUsage = sqliteTable("adviser_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }), userId: text("user_id").notNull(),
  requestAt: text("request_at").notNull(), inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
}, (table) => [index("idx_adviser_usage_user_time").on(table.userId, table.requestAt)]);
export const designs = sqliteTable("designs", {
  id: text("id").primaryKey(), inputs: text("inputs", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  updatedAt: text("updated_at").notNull(), updatedBy: text("updated_by").notNull(),
});

export const proposalVersions = sqliteTable("proposal_versions", {
 id:text("id").primaryKey(), inputs:text("inputs",{mode:"json"}).$type<Record<string,unknown>>().notNull(), requirements:text("requirements",{mode:"json"}).$type<Record<string,unknown>>().notNull(), createdAt:text("created_at").notNull(), createdBy:text("created_by").notNull(),
}, (table) => [index("idx_proposal_versions_created").on(table.createdAt)]);

export const designClaims = sqliteTable("design_claims", {
 id:text("id").primaryKey(), designId:text("design_id").notNull(), countryCode:text("country_code"),
 claim:text("claim").notNull(), value:text("value").notNull(), unit:text("unit").notNull(),
 claimType:text("claim_type").notNull(), sourceId:text("source_id"), period:text("period").notNull(),
 notes:text("notes").notNull(), updatedAt:text("updated_at").notNull(),
}, (table) => [index("idx_claims_design").on(table.designId)]);

export const roleChanges=sqliteTable("role_changes",{id:integer("id").primaryKey({autoIncrement:true}),actorId:text("actor_id").notNull(),targetId:text("target_id").notNull(),previousRole:text("previous_role").notNull(),newRole:text("new_role").notNull(),changedAt:text("changed_at").notNull()});
