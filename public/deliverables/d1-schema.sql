-- University AI Datacenter Planner — Cloudflare D1 schema

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  team TEXT,
  course_section TEXT,
  rules_accepted_at TEXT,
  rules_version TEXT,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE countries (
  code TEXT PRIMARY KEY,
  iso3 TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL,
  price_status TEXT NOT NULL,
  price_period TEXT,
  energy_year INTEGER,
  generation_twh REAL,
  demand_twh REAL,
  energy_metrics TEXT,
  renewable_share REAL,
  carbon_intensity REAL,
  mix TEXT,
  dc_records INTEGER NOT NULL DEFAULT 0,
  cluster_records INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT,
  price_retrieved_at TEXT,
  energy_retrieved_at TEXT
);

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  period TEXT,
  type TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  retrieved_at TEXT
);

CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

CREATE TABLE designs (
  id TEXT PRIMARY KEY,
  inputs TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE proposal_versions (
  id TEXT PRIMARY KEY,
  inputs TEXT NOT NULL,
  requirements TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE design_claims (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL,
  country_code TEXT,
  claim TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  source_id TEXT,
  period TEXT NOT NULL,
  notes TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  notes TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'current'
);

CREATE TABLE refreshes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  inputs TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE adviser_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  request_at TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE role_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  previous_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  changed_at TEXT NOT NULL
);
