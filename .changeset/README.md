# Changesets

Every change that affects a published package gets a changeset: run `npx changeset`, pick the packages and the bump (patch, minor, major), and write one line for the changelog. `npx changeset version` turns pending changesets into version bumps and CHANGELOG entries; `npx changeset publish` publishes to npm.

`@tessera/tokens` and `@tessera/react` always release together at the same version.
