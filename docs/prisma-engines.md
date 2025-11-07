# Refreshing Prisma engines offline

The build environment for WorkRight HRIS cannot reach `binaries.prisma.sh`.
To keep Prisma working offline while avoiding raw binaries in git, the repo
tracks **Base64-encoded** engine payloads under
`apps/api/prisma/engine-archives/<commit>/`. The helper scripts decode those
archives into the gitignored cache at `apps/api/prisma/engines/<commit>/` before
invoking Prisma. When Prisma is bumped, rebuild the engines, refresh the cache,
and regenerate the Base64 archives so they can be committed safely.

## Prerequisites

- Rust toolchain (`rustup`) installed.
- Sufficient disk space (building the engines pulls the full Prisma workspace).

## Steps

1. Determine the engine commit hash from
   `node_modules/.pnpm/@prisma+engines-version*/package.json` under the
   `prisma.enginesVersion` field.
2. Download the Prisma engines source for that commit:

   ```bash
   curl -L -o /tmp/prisma-engines.tar.gz \
     https://codeload.github.com/prisma/prisma-engines/tar.gz/<commit>
   mkdir -p /tmp/prisma-engines
   tar -xzf /tmp/prisma-engines.tar.gz --strip-components=1 -C /tmp/prisma-engines
   ```
3. Compile the Node-API query engine library and schema engine binary, passing
   the commit hash via `GIT_HASH` so the binaries report the correct version:

   ```bash
   cd /tmp/prisma-engines
   . "$HOME/.cargo/env"  # ensure Cargo is on PATH
   GIT_HASH=<commit> cargo build -p query-engine-node-api --release
   GIT_HASH=<commit> cargo build -p schema-engine-cli --release
   ```
4. Copy the resulting artifacts into the repository (they remain untracked):

   ```bash
   DEST=apps/api/prisma/engines/<commit>
   mkdir -p "$DEST"
   cp target/release/libquery_engine.so \
     "$DEST/libquery_engine-debian-openssl-3.0.x.so.node"
   cp target/release/schema-engine \
     "$DEST/schema-engine-debian-openssl-3.0.x"
   ```
5. Update `apps/api/scripts/run-prisma.mjs`, the `Dockerfile` `ARG
   PRISMA_ENGINES_COMMIT`, and documentation references to the new commit hash
   if it changed.
6. Regenerate the Base64 archives so they can be committed:

   ```bash
   pnpm --filter @workright/api run prisma:archive
   ```

   The command scans `apps/api/prisma/engines/<commit>/` for the binaries and
   writes the corresponding `.base64` files under
   `apps/api/prisma/engine-archives/<commit>/`.
7. Re-run `pnpm --filter @workright/api run prisma:generate` to confirm the
   local cache works (the helper will decode the Base64 archives if the
   binaries are missing).

## Publishing the binaries for teammates/CI

- **GitHub Release or internal object storage.** Package the decoded binaries or
  the generated `.base64` files into an archive (for example,
  `tar -czf prisma-engines-<commit>.tar.gz -C apps/api/prisma/engine-archives/<commit> .`)
  and upload it to a GitHub Release or a private blob store. Consumers can
  download the archive, extract it, run `pnpm --filter @workright/api run
  prisma:install-engines`, and re-run the Prisma scripts.
- **Network mirrors.** If your environment allows outbound requests to an
  allow-listed host, expose the tarball from an internal mirror and export
  `PRISMA_ENGINES_MIRROR` before invoking Prisma.
- **Environment overrides.** As a last resort, provide absolute paths via
  `PRISMA_QUERY_ENGINE_LIBRARY` and `PRISMA_SCHEMA_ENGINE_BINARY` when running
  `pnpm --filter @workright/api run prisma:*`. The helper script will use those
  paths instead of the local cache.

Keeping the binaries out of git allows us to share them through approved
channels while still supporting offline Docker builds and CI runners.
