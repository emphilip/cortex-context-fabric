-- The `hive` role is the only application user. The image creates it from
-- POSTGRES_USER/POSTGRES_PASSWORD; grants here scope the role to the hive_mind
-- schema specifically.
GRANT USAGE ON SCHEMA hive_mind TO hive;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA hive_mind TO hive;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA hive_mind TO hive;

ALTER DEFAULT PRIVILEGES IN SCHEMA hive_mind
  GRANT SELECT, INSERT, UPDATE ON TABLES TO hive;
ALTER DEFAULT PRIVILEGES IN SCHEMA hive_mind
  GRANT USAGE, SELECT ON SEQUENCES TO hive;

-- AGE graph access.
GRANT USAGE ON SCHEMA ag_catalog TO hive;
GRANT SELECT ON ALL TABLES IN SCHEMA ag_catalog TO hive;
