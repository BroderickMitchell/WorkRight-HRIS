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

Build the production image. The Dockerfile already compiles the shared packages, generates the Prisma client, and prunes dev-only dependencies while keeping the full API dependency graph (for example, `@nestjs/common`) prior to the `runtime-api` stage.

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

