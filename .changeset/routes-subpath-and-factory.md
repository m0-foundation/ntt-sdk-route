---
"@m0-foundation/ntt-sdk-route": minor
---

**Breaking:** `M0AutomaticRoute` no longer registers NTT protocols on class load (the `static {}` block has been removed). The supported entry point is now the new `m0AutomaticRoute()` factory function, which lazily registers NTT protocols on first invocation and returns the route constructor.

### Migration

```diff
- import { M0AutomaticRoute } from "@m0-foundation/ntt-sdk-route";
+ import { m0AutomaticRoute } from "@m0-foundation/ntt-sdk-route";

  const config = {
    routes: [
-     M0AutomaticRoute,
+     m0AutomaticRoute(),
      // ...
    ],
  };
```

The `M0AutomaticRoute` class is still exported (e.g. for type annotations and advanced subclassing), but using it directly without first calling `ensureM0Registered()`-equivalent register functions will fail at runtime with "no protocols registered for X:Ntt". The factory wraps registration for you.

### Why
The previous `static {}` block registered NTT protocols as a side effect of class load (basically import time). With sdk-*-ntt v5 explicitly removing auto-registration on import, m0 was the last library still doing implicit on-load registration in this dependency chain. The factory pattern matches what bridge-monorepo's other route wrappers (cctp, base-bridge, NTT) do — register lazily on factory invocation, triggered by the consumer's intentional use of the API.

### Other changes in this release
- Migrate `routes` namespace value-import from the deprecated `@wormhole-foundation/sdk-connect` barrel to the subpath (`@wormhole-foundation/sdk-connect/routes`). Type/value surface is identical.
- Bump `@wormhole-foundation/sdk`, `sdk-connect`, `sdk-evm`, `sdk-solana` from 4.9.1 → 4.18.0 (subpath only available in 4.14+).
- Bump NTT family (`sdk-definitions-ntt`, `sdk-evm-ntt`, `sdk-solana-ntt`, `sdk-route-ntt`) from 4.0.14 → 5.0.2.
