# API Docker image workflow

This guide captures the exact steps we follow to build and publish the production API container. It expands on the summary in the root README and is safe to share with operators who do not work in the monorepo every day.

## Prerequisites

- Docker Engine 24+ (or Docker Desktop with BuildKit enabled).
- Access to the container registry you plan to push to (Azure Container Registry in the example commands below).
- A populated workspace (`pnpm install`) with the Prisma schema already generated so the Docker build does not need to reach out to the public npm registry.

> [!NOTE]
> The sandbox that runs automated checks for this repository blocks outbound network traffic to the npm registry. This is why the check that runs `pnpm --filter @workright/api run build` in CI currently reports a failure. When executed from a workstation or CI runner with registry access, the command succeeds once `pnpm install` has primed the local store.

## Build and push

From the repository root:

```bash
az acr login --name <acr-name>
```

Authenticate the Docker CLI against your registry.

```bash
docker build \
  --file Dockerfile \
  --target runtime-api \
  --tag <acr-name>.azurecr.io/workright/api:<tag> \
  .
```

Build the production image. The Dockerfile already compiles the shared packages, generates the Prisma client, and prunes dev-only dependencies so only the production graph required by `@workright/api` ships in the `runtime-api` stage.

```bash
docker push <acr-name>.azurecr.io/workright/api:<tag>
```

Push the tagged image to your registry so your deployment automation can pull it.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `pnpm` fails with a proxy error during `docker build` | The build environment cannot reach `registry.npmjs.org` | Run `pnpm install` locally before building so the workspace store is ready, or mirror the dependencies inside your network |
| API fails to start because Prisma schema is missing | `pnpm prisma generate` was skipped | Run `pnpm --filter @workright/api run prisma:generate` before building or bake it into your CI pipeline |
| Image size is larger than expected | Build was run without the `runtime-api` target | Ensure `--target runtime-api` (or the multi-stage default) is used |

## Prisma engines (gitignored cache)

`pnpm prisma generate` and the migration commands need the Prisma query engine
and schema engine binaries, but the sandbox cannot download them at build time.
The repository now reserves `apps/api/prisma/engines/<commit>/` as a drop-in
cache plus `apps/api/prisma/engine-archives/<commit>/` for Base64-encoded
artifacts (see `docs/prisma-engines.md`). Populate the cache locally—or extract
the archives and run `pnpm --filter @workright/api run prisma:install-engines`
—before building the Docker image so the helper script can inject
`PRISMA_QUERY_ENGINE_LIBRARY` and `PRISMA_SCHEMA_ENGINE_BINARY` automatically.

If you upgrade Prisma:

1. Check `node_modules/.pnpm/@prisma+engines-version*/package.json` for the
   new `enginesVersion` hash.
2. Rebuild the engines once (Rust toolchain commands are documented in
   `docs/prisma-engines.md`), copy the artifacts into
   `apps/api/prisma/engines/<hash>/` locally, and run
   `pnpm --filter @workright/api run prisma:archive` so the `.base64` payloads
   stay in sync.
3. Update `apps/api/scripts/run-prisma.mjs`, `apps/api/scripts/install-prisma-engines.mjs`,
   the `Dockerfile` `PRISMA_ENGINES_COMMIT` argument, and the documentation
   references to the new hash if required.

Because the binaries are ignored by git, share the generated `.base64` files (or
decoded binaries) via an approved artifact store (for example, a GitHub Release
tarball). Extract them before invoking the Docker build and run
`pnpm --filter @workright/api run prisma:install-engines` so the
`run-prisma.mjs` wrapper can locate the files without reaching
`binaries.prisma.sh`.

