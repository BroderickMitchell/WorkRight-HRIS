# Managing Prisma engines

The repository now relies on Prisma's built-in engine distribution. Whenever the
`prisma generate` command runs, Prisma downloads the matching query and schema
engines and stores them under `node_modules/.prisma/client`. No custom commit
hashes or Base64 archives are required.

## Standard (online) workflow

Run the following command from the monorepo root whenever you need to refresh
the Prisma client or after updating the schema:

```bash
pnpm --filter @workright/api exec prisma generate
```

The Dockerfile performs the same step during the dependency-install stage so
CI/CD builds automatically pick up the required binaries. If the CLI complains
about missing engines, ensure the `prisma` package is installed (it is tracked
as a devDependency of `@workright/api`) and rerun the command above.

## Offline or air-gapped builds

If you must build in an environment without outbound access, vendor the engines
alongside the Docker build context. Prisma expects the binaries to live under
`apps/api/prisma/engines/<commit>/` when the related environment variables are
set. Populate that directory before running `pnpm --filter @workright/api exec
prisma generate` in the container image:

1. Determine the desired Prisma engine commit (`PRISMA_ENGINES_COMMIT`). The
   value is available in `node_modules/.pnpm/@prisma+engines-version*/package.json`
   under `prisma.enginesVersion`.
2. Create the target directory locally (it must match the commit hash):

   ```bash
   mkdir -p apps/api/prisma/engines/$PRISMA_ENGINES_COMMIT
   ```

3. Download the Debian OpenSSL 3 artifacts for that commit from Prisma's CDN or
   an internal mirror and place them in the directory created above:
   - `libquery_engine-debian-openssl-3.0.x.so.node`
   - `schema-engine-debian-openssl-3.0.x`

   The downloads are typically gzipped (`*.gz`); extract them before copying and
   remember to `chmod +x` the schema engine binary.
4. When building the container image, copy the populated directory into the
   build context and export the environment variables shown below so Prisma uses
   the vendored binaries:

   ```dockerfile
   ARG PRISMA_ENGINES_COMMIT=<commit>
   ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/apps/api/prisma/engines/$PRISMA_ENGINES_COMMIT/libquery_engine-debian-openssl-3.0.x.so.node \
       PRISMA_SCHEMA_ENGINE_BINARY=/app/apps/api/prisma/engines/$PRISMA_ENGINES_COMMIT/schema-engine-debian-openssl-3.0.x
   ```

These steps mirror the legacy workflow but keep the binaries entirely inside
your trusted network. When network access is available, prefer the standard
workflow so Prisma manages downloads automatically.
