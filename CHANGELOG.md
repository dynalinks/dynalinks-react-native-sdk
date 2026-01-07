# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-07

### Breaking Changes

- **API Rewrite**: Complete rewrite to match Flutter SDK structure
- **Removed**: Event-based `addDeferredDeepLinkListener()` API
- **Changed**: `configureDynalinks(apiKey)` → `Dynalinks.configure({ clientAPIKey })`
- **Changed**: Property names now use camelCase (e.g., `deep_link_value` → `deepLinkValue`)

### Added

- New promise-based API for cleaner async/await patterns
- `Dynalinks.configure()` with full configuration options (logLevel, allowSimulator)
- `Dynalinks.checkForDeferredDeepLink()` returns promise instead of emitting event
- `Dynalinks.resolveLink(url)` for manual URL resolution
- Comprehensive TypeScript types and error classes
- Better error handling with specific error codes

### Improved

- Documentation rewritten to match Flutter SDK style
- Integration with React Native's `Linking` API
- Clearer API surface with singleton pattern

### Migration

See README.md for migration guide from v0.1.0.

## [0.1.0]

Initial release.
