# Prisma engine archives

Base64-encoded Prisma engine artifacts live here so they can be tracked in git while the decoded binaries remain gitignored in `../engines/`.

Each subdirectory should match the Prisma engine commit hash (for example `34b5a692b7bd79939a9a2c3ef97d816e749cda2f/`). Inside that folder, include one `.base64` file per engine:

- `libquery_engine-debian-openssl-3.0.x.so.node.base64`
- `schema-engine-debian-openssl-3.0.x.base64`

Use `pnpm --filter @workright/api run prisma:archive` to regenerate these files from freshly built binaries. The Prisma helper scripts automatically decode any present archives back into executable binaries under `../engines/` before invoking the Prisma CLI.
