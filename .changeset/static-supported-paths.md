---
"@m0-foundation/ntt-sdk-route": minor
---

Only offer bridging paths the Portal actually accepts.

Destination tokens are now resolved against `supportedBridgingPath` instead of a
hardcoded token cross-product, and `validate()` re-checks the exact
(source token, chain, destination token) triple before quoting. Candidates come
from a per-chain token list in `src/tokens.ts`.

Also fixes `EvmRouter`/`SvmRouter` returning a router bound to the first chain
touched, adds BSC to the chain id map, and makes `isAvailable()` honour the
Portal's send pause.
