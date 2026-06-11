## 1. Shared types

- [ ] 1.1 Add `Entity`, `EntityListItem`, `VectorSearchHit`, `IngestionRun`, `ConnectorStatus` to `packages/shared/src/index.ts`
- [ ] 1.2 Mirror them as Pydantic models in `packages/shared-py/src/hive_mind_shared/types.py`
- [ ] 1.3 Re-export from `__init__.py`

## 2. Catalog store

- [ ] 2.1 Add `CatalogStore.list_entities(tenant, *, source?, classification?, freshness_state?, limit, offset)` returning `(rows, total)`
- [ ] 2.2 Add `CatalogStore.get_entity_with_lineage(tenant, entity_id)` returning the row plus parent and chunk children
- [ ] 2.3 Add `CatalogStore.tombstone(tenant, entity_id)` (idempotent)
- [ ] 2.4 Tests: filter combinations, lineage chunk listing, tombstone idempotency

## 3. Vector index

- [ ] 3.1 Add `VectorIndex.search_all(vector, top_k, filters?)` returning cross-collection RRF-fused hits with `collection` per hit
- [ ] 3.2 Unit tests with a fake `AsyncQdrantClient`

## 4. Pipeline HTTP surface (new endpoints)

- [ ] 4.1 `GET /entities` — list with filters and pagination
- [ ] 4.2 `GET /entities/{id}` — single entity with lineage block
- [ ] 4.3 `DELETE /entities/{id}` — tombstone
- [ ] 4.4 `POST /search/vector` — embed → cross-collection search → response with model/provider/tokens; OTel span `pipeline.vector_search`; token counter increment with `stage="vector_search"`
- [ ] 4.5 Ingestion proxies: `GET /ingestion/connectors`, `POST /ingestion/git/run`, `GET /ingestion/runs/recent`
- [ ] 4.6 Endpoint tests (httpx test client + fakes for catalog/vector/ingestion)

## 5. Ingestion HTTP service

- [ ] 5.1 New `services/ingestion/src/hive_mind_ingestion/server.py` with FastAPI app
- [ ] 5.2 Endpoints: `/healthz`, `/readyz`, `GET /connectors`, `POST /run/git`, `GET /runs/recent`
- [ ] 5.3 In-memory run-history store (capped at 100) + background-task runner
- [ ] 5.4 Update `services/ingestion/Dockerfile` `CMD` to run uvicorn on port 8100
- [ ] 5.5 Update `infra/compose/docker-compose.yml`: expose port 8100 inside the network, add healthcheck, point `pipeline` proxies at `http://ingestion:8100`
- [ ] 5.6 Tests for endpoints (sync httpx test client) and run-history capping

## 6. Admin UI — vector explorer

- [ ] 6.1 Page `services/admin-ui/src/app/vectors/page.tsx` (server component handling form + initial render; client component for results table)
- [ ] 6.2 Component `VectorHit.tsx` + `VectorHit.stories.tsx` (canonical / empty / error)
- [ ] 6.3 Status header showing `embedding_model` + `vector_size` from `GET /readyz`
- [ ] 6.4 vitest unit tests for `VectorHit`

## 7. Admin UI — entities

- [ ] 7.1 Page `services/admin-ui/src/app/entities/page.tsx` (filters + paginated list)
- [ ] 7.2 Page `services/admin-ui/src/app/entities/[id]/page.tsx` (detail + lineage + tombstone)
- [ ] 7.3 Component `EntityRow.tsx` + `.stories.tsx`
- [ ] 7.4 Component `EntityDetail.tsx` + `.stories.tsx`
- [ ] 7.5 Tombstone confirm dialog + post action
- [ ] 7.6 vitest unit tests

## 8. Admin UI — ingestion

- [ ] 8.1 Page `services/admin-ui/src/app/ingestion/page.tsx`
- [ ] 8.2 Component `ConnectorCard.tsx` + `.stories.tsx`
- [ ] 8.3 Component `IngestionRunRow.tsx` + `.stories.tsx`
- [ ] 8.4 "Run now" form with input validation
- [ ] 8.5 vitest unit tests

## 9. Cross-cutting

- [ ] 9.1 Update `services/admin-ui/src/app/layout.tsx` nav to include the four pages
- [ ] 9.2 `pnpm --filter @hive-mind/admin-ui build-storybook` succeeds without warnings
- [ ] 9.3 `pnpm --filter @hive-mind/admin-ui build` succeeds
- [ ] 9.4 All existing tests still pass (`uv run pytest` and `pnpm -r test`)

## 10. Smoke

- [ ] 10.1 Extend `tests/smoke/run.sh`: after the existing ingest+retrieve check, hit `POST /search/vector` and assert ≥ 1 hit; hit `GET /entities?limit=1` and assert a row exists; hit `DELETE /entities/{id}` for one chunk and assert `tombstoned_at` round-trips
- [ ] 10.2 Run smoke against the live stack

## 11. Docs

- [ ] 11.1 README: short note pointing at the new admin pages
- [ ] 11.2 `docs/OPERATIONS.md`: section on vector search and tombstone semantics
