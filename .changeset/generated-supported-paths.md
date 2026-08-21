---
"@m0-foundation/ntt-sdk-route": minor
---

Only offer bridging paths the Portal actually accepts.

Destination tokens are now resolved against `supportedBridgingPath` instead of a
hardcoded token cross-product, and `validate()` re-checks the exact
(source token, chain, destination token) triple before quoting. The candidate set
is generated from live Portal state and refreshed daily.

Also fixes `EvmRouter`/`SvmRouter` returning a router bound to the first chain
touched, adds BSC to the chain id map, and makes `isAvailable()` honour the
Portal's send pause.
