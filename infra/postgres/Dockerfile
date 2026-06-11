# Postgres 16 with Apache AGE (graph) + pg_trgm + tsvector (BM25-ish).
# AGE upstream ships images per (PG version, AGE version) — see
# https://hub.docker.com/r/apache/age/tags. Pinned to the current PG16 release.
FROM apache/age:release_PG16_1.6.0

# Apache AGE image already exposes the extension; ensure trgm and unaccent are
# loaded at init time.
COPY ./init/ /docker-entrypoint-initdb.d/

# Postgres image already runs the .sql files in this directory at first start
# in lexical order, so file names are prefixed with sequence numbers.
