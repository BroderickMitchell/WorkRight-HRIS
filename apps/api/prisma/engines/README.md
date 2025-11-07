# Prisma engine drop-in directory

Place the Prisma query engine (`libquery_engine-<target>.so.node`) and schema engine (`schema-engine-<target>`) artifacts in a
subfolder named after the engine commit (for example, `apps/api/prisma/engines/<commit>/`).

These binaries are **not** tracked in git. When you refresh Prisma, rebuild the engines once on an
internet-connected workstation, copy the resulting files into this directory, and then run
`pnpm --filter @workright/api run prisma:archive` to refresh the Base64 payloads in
`../engine-archives/<commit>/`. See `docs/prisma-engines.md` for detailed instructions and guidance on
publishing the artifacts (either the decoded binaries or the Base64 files) to an internal mirror or GitHub
Release so air-gapped environments can consume them.
